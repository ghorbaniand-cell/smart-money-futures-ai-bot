import fs from 'node:fs/promises';
import path from 'node:path';

/*
 * GFTSH — TOKEN SHORT-WALLET LIVE FUTURES OBSERVER
 * READ ONLY | NO ORDERS | NO AUTO-COPY
 *
 * Scans 27 selected Hyperliquid perpetual-futures accounts every 5 minutes; Trader 6 removed by user request.
 * Alerts:
 *  1) A newly opened position detected in recent fills (independent of entry distance).
 *  2) Any currently open position whose mark is within the configured entry band
 *     (default 1.00%), once per observed position lifecycle.
 *
 * Same-side adds/averages are not treated as new entries. Telegram delivery is
 * deduplicated only after Telegram confirms the send succeeded.
 *
 * The added public-ranking wallets are research candidates for manual review,
 * not endorsements or automated-copy targets.
 */

const VERSION = 'GFTSH-27W-LIVE-OBSERVER-V3.27.1-REMOVE-TRADER6-24H-30D-SEPARATE-RANKINGS';
const API = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz/info';
const TG_TOKEN = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || '';

const SCAN_INTERVAL_MIN = Math.max(1, Number(process.env.GFTSH_SCAN_INTERVAL_MIN || 5));
const LOOKBACK_MIN = Math.max(5, Number(process.env.GFTSH_LOOKBACK_MIN || 20));
const ENTRY_BAND_PCT = Math.max(0.01, Number(process.env.GFTSH_ENTRY_BAND_PCT || 1.0));
const REQUEST_GAP_MS = Math.max(100, Number(process.env.GFTSH_REQUEST_GAP_MS || 250));
const TIMEOUT_MS = Math.max(3000, Number(process.env.GFTSH_REQUEST_TIMEOUT_MS || 15000));
const RETRIES = Math.max(1, Number(process.env.GFTSH_RETRIES || 3));
const RETRY_BASE_MS = Math.max(200, Number(process.env.GFTSH_RETRY_BASE_MS || 500));
const MIN_ALERT_NOTIONAL = Math.max(0, Number(process.env.GFTSH_MIN_ALERT_NOTIONAL_USD || 50));
const TELEGRAM_MAX = Math.max(1000, Number(process.env.GFTSH_TELEGRAM_MAX_CHARS || 3800));
const SEND_STARTUP_STATUS = String(process.env.GFTSH_SEND_STARTUP_STATUS || 'true').toLowerCase() !== 'false';

const STATE_FILE = process.env.GFTSH_WATCH_STATE_FILE || 'production/state/gftsh_10_wallet_observer.json';
const TG_STATE_FILE = process.env.GFTSH_WATCH_TELEGRAM_STATE_FILE || 'production/state/gftsh_10_wallet_telegram.json';

const DEFAULT_WALLETS = [
  ['⭐ Trader 1 ⭐', '0xe2823659be02e0f48a4660e4da008b5e1abfdf29'],
  ['⭐ Trader 2 ⭐', '0x909eb3d5ff0ac0df12c81f8495860cfccf1e7ea9'],
  ['⭐ Trader 3 ⭐', '0x8efa981f60384083496148b55361a83edc268295'],
  ['⭐ Trader 4 ⭐', '0x8bae3527e5a33fa0cf184f37bc112d071463ab6d'],
  ['⭐ Trader 5 ⭐', '0x53f8f390fd4f70941c5d160a964f6893c8dbceff'],
  ['⭐ Trader 7 ⭐', '0xc0b2a1ce425d0cd8bc321c445fa6ae0eaed2e688'],
  ['⭐ Trader 8 ⭐', '0xce508465b243216fcf372d3146fd62e8f7a7b8e2'],
  ['⭐ Trader 9 ⭐', '0xfdbaa5eee7cdf45eec3a71a672065a67191fda7a'],
  ['⭐ Trader 10 ⭐', '0x3dd462347e7b42b5a3ea15132b677a4978af7a81'],
  ['⭐ Trader 11 ⭐', '0x88250cf2f6402e856bc85fc65095e4a48bb12cb7'],
  ['⭐ Trader 12 ⭐', '0x0c1f6941fdcde9488dfd36ca16fed6b3bc49672b'],
  ['⭐ Trader 13 ⭐', '0xf179326c91d7233ae833d668c5d44c6a7d472161'],
  ['⭐ Trader 14 ⭐', '0xe5731d975d84c7222ebfd0ce8239f04ea3164e55'],
  ['⭐ Trader 15 ⭐', '0x19f5c3bc2e0978d9a1da389d7d4cfe33cd770fe9'],
  ['⭐ Trader 16 ⭐', '0x36ac01de9bc76c0d744b38c3e13a0538d55c7568'],
  ['⭐ Trader 17 ⭐', '0xbd334a55db91617545e8d1b09941e036ad8e4200'],
  ['⭐ Trader 18 ⭐', '0x767f6dcea7e1d520a3b7ac251b30178a79eb2ab0'],
  ['⭐ Trader 19 ⭐', '0xe31501c472d557bfa145ce105d325fb2dd4cb867'],
  ['⭐ Trader 20 ⭐ — PONS short candidate — large open short; reported PONS realized PnL', '0x936cf4fb95c30ce83f658b5bbb247e4bb381bb0f'],
  ['⭐ Trader 21 ⭐ — PONS short candidate — profitable open short', '0xd4c1f7e8d876c4749228d515473d36f919583d1d'],
  ['⭐ Trader 22 ⭐ — STRK short candidate — large profitable open short', '0x8af700ba841f30e0a3fcb0ee4c4a9d223e1efa05'],
  ['⭐ Trader 23 ⭐ — STRK short candidate — profitable open short', '0x7717a7a245d9f950e586822b8c9b46863ed7bd7e'],
  ['⭐ Trader 24 ⭐', '0x1081e214bd6f0137234b92432d9b6033b88965b7'],
  ['⭐ Trader 25 ⭐ — recent-activity research candidate', '0x4bafc8eca50fc3208fb2520a2a49980768ec60f6'],
  ['⭐ Trader 26 ⭐ — high reported win rate / +$956k all-time PnL / positive reported open uPnL; verify current live positions', '0xd142479997958a4fefd1f8d5373b31ce36987d73'],
  ['Trader 27', '0x736850ee773ac6170fcaeda596514269b863ee56'],
  ['Trader 28', '0xde0e9b1a35322a809165d09f0490cca3fa7562e5'],
];

function parseWallets() {
  const raw = String(process.env.GFTSH_WATCH_WALLETS || '').trim();
  const source = raw
    ? raw.split(',').map(x => x.trim()).filter(Boolean).map((item, i) => {
        const [label, address] = item.includes('|')
          ? item.split('|').map(x => x.trim())
          : [`Trader #${i + 1}`, item];
        return [label || `Trader #${i + 1}`, address];
      })
    : DEFAULT_WALLETS;

  const seen = new Set();
  const out = [];
  for (const [label, address] of source) {
    const normalized = String(address || '').toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push([label || `Trader #${out.length + 1}`, normalized]);
  }
  if (out.length !== 27) {
    throw new Error(`Expected exactly 27 unique valid wallet addresses (Trader 6 removed); got ${out.length}. Check GFTSH_WATCH_WALLETS.`);
  }
  return out;
}

const WALLETS = parseWallets();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const short = address => `${address.slice(0, 8)}…${address.slice(-6)}`;

function fmtPx(value) {
  const n = num(value);
  if (!(n > 0)) return '—';
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.01) return n.toFixed(6);
  if (n >= 0.0001) return n.toFixed(8);
  return n.toExponential(5);
}
function fmtPct(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}%` : '—';
}
function fmtLev(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `${n.toFixed(n >= 10 ? 1 : 2)}x` : 'Not provided';
}
function notional(fill) {
  return Math.abs(num(fill?.sz) * num(fill?.px));
}
function fillKey(fill) {
  return String(fill?.tid ?? `${fill?.coin}|${fill?.time}|${fill?.oid}|${fill?.px}|${fill?.sz}|${fill?.dir}`);
}
function postPositionFromFill(fill) {
  const before = num(fill?.startPosition);
  const size = Math.abs(num(fill?.sz));
  const dir = String(fill?.dir || '').toLowerCase();
  if (dir.includes('open long')) return before + size;
  if (dir.includes('open short')) return before - size;
  if (dir.includes('close long')) return before - size;
  if (dir.includes('close short')) return before + size;
  if (dir.includes('buy')) return before + size;
  if (dir.includes('sell')) return before - size;
  return before;
}
function isNewPositionFill(fill) {
  const before = num(fill?.startPosition);
  const after = postPositionFromFill(fill);
  if (Math.abs(after) < 1e-12) return false;
  // Flat -> non-flat is a new position. A side flip is also a new lifecycle.
  if (Math.abs(before) < 1e-12) return true;
  if (Math.sign(before) !== Math.sign(after)) return true;
  // Same-side non-flat -> larger same-side position is an add/average, not a new entry.
  return false;
}
function sideFromFill(fill) {
  const dir = String(fill?.dir || '').toLowerCase();
  if (dir.includes('open short') || dir.includes('close short')) return 'SHORT';
  if (dir.includes('open long') || dir.includes('close long')) return 'LONG';
  const after = postPositionFromFill(fill);
  if (after > 0) return 'LONG';
  if (after < 0) return 'SHORT';
  return dir.includes('sell') ? 'SHORT' : 'LONG';
}

let requestGate = Promise.resolve();
let nextRequestAt = 0;
async function pace() {
  requestGate = requestGate.then(async () => {
    const wait = Math.max(0, nextRequestAt - Date.now());
    if (wait) await sleep(wait);
    nextRequestAt = Date.now() + REQUEST_GAP_MS;
  });
  return requestGate;
}
async function postInfo(body, label) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    await pace();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const bodyText = await response.text();
      if (!response.ok) throw new Error(`${label}: HTTP ${response.status} ${bodyText.slice(0, 180)}`);
      return JSON.parse(bodyText);
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) await sleep(RETRY_BASE_MS * (2 ** (attempt - 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error(`${label}: failed`);
}
async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}
async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2));
}
function extractPositions(state) {
  const rows = Array.isArray(state?.assetPositions) ? state.assetPositions : [];
  return rows.map(row => {
    const p = row?.position || row || {};
    const szi = num(p.szi);
    return {
      coin: String(p.coin || ''),
      szi,
      side: szi > 0 ? 'LONG' : szi < 0 ? 'SHORT' : 'FLAT',
      entry: num(p.entryPx),
      positionValue: Math.abs(num(p.positionValue)),
      unrealizedPnl: num(p.unrealizedPnl),
      leverage: num(p?.leverage?.value) || num(p?.leverage?.leverage) || num(p?.leverage)
    };
  }).filter(p => p.coin && p.side !== 'FLAT');
}
function findPosition(positions, coin, side) {
  return positions.find(p => p.coin === coin && p.side === side) || null;
}
async function fetchCurrentState(address) {
  return postInfo({ type: 'clearinghouseState', user: address }, `state:${short(address)}`);
}
async function fetchFills(address, startTime, endTime) {
  const rows = await postInfo({
    type: 'userFillsByTime', user: address, startTime, endTime, aggregateByTime: false
  }, `fills:${short(address)}`);
  return Array.isArray(rows) ? rows : [];
}
async function fetchMids() {
  return postInfo({ type: 'allMids' }, 'allMids');
}

function formatAlert(a) {
  const icon = a.side === 'LONG' ? '🟢' : '🔴';
  const entry = num(a.entry);
  const slDistance = entry * 0.005;
  const tpDistance = slDistance * 2;
  const modelSL = a.side === 'LONG' ? entry - slDistance : entry + slDistance;
  const modelTP = a.side === 'LONG' ? entry + tpDistance : entry - tpDistance;
  const priority = String(a.trader || '').includes('⭐') ? '⭐ PRIORITY TRADER ⭐\n' : '';
  const eventTitle = priority + (a.alertType === 'NEW_ENTRY'
    ? '🐋 SMART MONEY — NEW POSITION OPENED'
    : '🐋 SMART MONEY — OPEN POSITION NEAR ENTRY');
  return [
    eventTitle,
    '━━━━━━━━━━━━━━━━━━',
    `👤 ${a.trader}`,
    `🔗 ${a.address}`,
    '',
    `${icon} ${a.side} ${a.coin}`,
    `🔔 Event: ${a.alertType === 'NEW_ENTRY' ? 'NEW ENTRY FILL' : 'OPEN POSITION WITHIN ENTRY BAND'}`,
    `⚡ Leverage: ${fmtLev(a.leverage)}`,
    `📍 Entry: ${fmtPx(a.entry)}`,
    `💵 Current Mark: ${fmtPx(a.current)}`,
    `📏 Mark-to-entry distance: ${fmtPct(a.distancePct)}`,
    `💰 Position/fill notional: $${num(a.notional).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
    `🕒 Fill time: ${a.fillTime ? new Date(a.fillTime).toISOString() : 'not available'}`,
    '',
    `🎯 Reference TP (not trader's TP): ${fmtPx(modelTP)}`,
    `🛑 Reference SL (not trader's SL): ${fmtPx(modelSL)}`,
    `📐 Existing-position entry band: ${ENTRY_BAND_PCT.toFixed(2)}%`,
    '',
    '⚠️ Reference TP/SL are illustrative only; they are not read from the trader.',
    '🛡 READ-ONLY | NO ORDERS | NO AUTO-COPY'
  ].join('\n');
}
async function sendTelegram(message) {
  if (!TG_TOKEN || !TG_CHAT) return { sent: false, reason: 'telegram_not_configured' };
  const text = message.length > TELEGRAM_MAX
    ? `${message.slice(0, TELEGRAM_MAX - 60)}\n\n⚠️ Message truncated.`
    : message;
  const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text, disable_web_page_preview: true })
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Telegram HTTP ${response.status}: ${responseText.slice(0, 200)}`);
  const data = JSON.parse(responseText);
  if (!data.ok) throw new Error(`Telegram API returned ok=false: ${responseText.slice(0, 200)}`);
  return { sent: true };
}
async function sendStartupStatus() {
  if (!SEND_STARTUP_STATUS) return;
  await sendTelegram([
    '👁️ GFTSH — 28 WALLET OBSERVER',
    '━━━━━━━━━━━━━━━━━━',
    '📡 Status: WATCHING',
    `👥 Wallets: ${WALLETS.length}`,
    `⏱ Scan interval: ${SCAN_INTERVAL_MIN} minutes`,
    `📐 Existing-position entry band: ${ENTRY_BAND_PCT.toFixed(2)}%`,
    '📚 Market: Hyperliquid Perpetual Futures',
    '🛡 Mode: READ-ONLY',
    '❌ Orders: DISABLED',
    '❌ Auto-copy: DISABLED'
  ].join('\n'));
}


function formatPerformanceReport(performanceByWallet, now) {
  const all = [...performanceByWallet.values()];
  const money = n => `${n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}`;
  const pct = n => n === null || !Number.isFinite(n) ? 'N/A' : `${n.toFixed(1)}%`;
  const decided = p => p.wins + p.losses;
  const winRate = p => decided(p) > 0 ? p.wins / decided(p) * 100 : null;
  const roi = p => p.closedNotional > 0 ? p.realizedPnl / p.closedNotional * 100 : null;
  const active24h = all.filter(p => p.entryFills > 0 || p.closeFills > 0);
  const byEntries = [...active24h].sort((a,b) => b.entryFills-a.entryFills || b.pnl24h-a.pnl24h);
  const byPnl24 = [...active24h].filter(p => p.closeFills > 0).sort((a,b) => b.pnl24h-a.pnl24h);
  const byHistory = [...all].filter(p => p.historyCloseFills > 0).sort((a,b) => b.historyPnl-a.historyPnl);
  const sum = (arr, key) => arr.reduce((n,p) => n + (Number(p[key]) || 0), 0);
  const wins24 = sum(active24h,'wins'), losses24 = sum(active24h,'losses');
  const totalPnl24 = sum(active24h,'pnl24h');
  const totalClose24 = sum(active24h,'closeFills');
  const totalEntries = sum(active24h,'entryFills');
  const totalMissing24 = sum(active24h,'missingPnl');
  const totalHistPnl = sum(all,'historyPnl');
  const totalHistClose = sum(all,'historyCloseFills');
  const lines = [
    '📊 GFTSH — 24H PERFORMANCE + 30D CONTEXT',
    '━━━━━━━━━━━━━━━━━━',
    `📅 24H period (UTC): ${new Date(now - 24*60*60_000).toISOString()} → ${new Date(now).toISOString()}`,
    `👥 Wallets with entries/closes in 24h: ${active24h.length}/28`,
    `🚪 New position entries in 24h: ${totalEntries}`,
    `💵 Realized PnL from closes in 24h: ${money(totalPnl24)}`,
    '📌 Inactive wallets do not block the report. 24h and 30d metrics are separated.',
    '',
    '🏃 MOST ACTIVE — NEW ENTRIES (24H)',
    '━━━━━━━━━━━━━━━━━━'
  ];
  if (!byEntries.length) lines.push('No new entries or closes detected in the 24h period.');
  byEntries.forEach((p,i) => lines.push(`${i+1}. ${p.trader}`, `New entries: ${p.entryFills} | 24h closes: ${p.closeFills} | 24h PnL: ${money(p.pnl24h)}`));
  lines.push('', '💰 BEST REALIZED PnL — CLOSED FILLS IN 24H', '━━━━━━━━━━━━━━━━━━');
  if (!byPnl24.length) lines.push('No closing fills detected in the 24h period.');
  byPnl24.forEach((p,i) => lines.push(`${i+1}. ${p.trader}`, `24h PnL: ${money(p.pnl24h)} | W/L fills: ${p.wins}/${p.losses} | Win rate: ${pct(winRate(p))}`, `Close fills: ${p.closeFills} | ROI*: ${pct(p.closedNotional > 0 ? p.pnl24h/p.closedNotional*100 : null)} | Missing PnL: ${p.missingPnl}`));
  lines.push('', '📚 HISTORICAL CONTEXT — LAST 30 DAYS / AVAILABLE SAMPLE', '━━━━━━━━━━━━━━━━━━');
  if (!byHistory.length) lines.push('No historical closing fills available.');
  byHistory.forEach((p,i) => lines.push(`${i+1}. ${p.trader}`, `30d/sample PnL: ${money(p.historyPnl)} | Close fills: ${p.historyCloseFills} | W/L: ${p.historyWins}/${p.historyLosses} | Win rate: ${pct(p.historyWins+p.historyLosses ? p.historyWins/(p.historyWins+p.historyLosses)*100 : null)}`));
  lines.push(
    '', '━━━━━━━━━━━━━━━━━━',
    `💵 Total realized PnL (24h closes): ${money(totalPnl24)}`,
    `🎯 24h fill win rate: ${pct(wins24+losses24 ? wins24/(wins24+losses24)*100 : null)}`,
    `🚪 New entries (24h): ${totalEntries}`,
    `📦 Closing fills (24h): ${totalClose24}`,
    `⚠️ Closing fills without PnL (24h): ${totalMissing24}`,
    `📚 30d/sample realized PnL: ${money(totalHistPnl)} | closing fills: ${totalHistClose}`,
    '',
    '*ROI = realized PnL / closing-fill notional; approximate, not account ROI.',
    'Win rate is per fill, not independent reconstructed trades. 24h PnL includes fills closed during the period; positions still open are excluded.',
    '30d history may be limited by the Hyperliquid API response cap; it is labelled context, not a guaranteed complete 30-day ledger.',
    '🛡 READ-ONLY | NO ORDERS | NO AUTO-COPY'
  );
  return lines;
}

async function sendPerformanceReport(performanceByWallet, now) {
  const lines = formatPerformanceReport(performanceByWallet, now);
  const chunks = [];
  let chunk = '';
  for (const line of lines) {
    const candidate = chunk ? `${chunk}\n${line}` : line;
    if (candidate.length > TELEGRAM_MAX - 100) {
      if (chunk) chunks.push(chunk);
      chunk = line;
    } else chunk = candidate;
  }
  if (chunk) chunks.push(chunk);
  for (let i = 0; i < chunks.length; i++) {
    const suffix = chunks.length > 1 ? `\n\n📄 Part ${i + 1}/${chunks.length}` : '';
    const result = await sendTelegram(chunks[i] + suffix);
    if (!result.sent) throw new Error('Telegram destination not configured; report not sent');
  }
}

async function main() {
  const startedAt = Date.now();
  const now = Date.now();
  const startTime = Math.max(0, now - LOOKBACK_MIN * 60_000);
  // Performance history is independent from the shorter alert lookback.
  const performanceStartTime = Math.max(0, now - 24 * 60 * 60_000);
  // Separate longer-term context from the strict 24-hour scorecard. Hyperliquid's
  // fills endpoint may cap results, so history is explicitly labelled 30-day/sample.
  const historyStartTime = Math.max(0, now - 30 * 24 * 60 * 60_000);
  console.log(`\n${VERSION}`);
  console.log('READ-ONLY | NO ORDERS | NO AUTO-COPY | FUTURES ONLY');
  console.log(`Watching ${WALLETS.length} wallets every ${SCAN_INTERVAL_MIN} minutes; entry band ${ENTRY_BAND_PCT.toFixed(2)}%.`);

  const state = await readJson(STATE_FILE, {
    version: VERSION, initialized: false, lastScanAt: 0, wallets: {},
    alertedOpenPositionKeys: [], alertedNewEntryFillKeys: []
  });
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Observer state JSON must be an object.');
  if (!state.wallets || typeof state.wallets !== 'object' || Array.isArray(state.wallets)) state.wallets = {};
  if (!Array.isArray(state.alertedOpenPositionKeys)) state.alertedOpenPositionKeys = [];
  if (!Array.isArray(state.alertedNewEntryFillKeys)) state.alertedNewEntryFillKeys = [];

  // Prevent overlapping scheduled/manual runs from producing duplicate Telegram alerts.
  const lastScanAt = num(state.lastScanAt);
  const age = Date.now() - lastScanAt;
  if (lastScanAt && age >= 0 && age < 2 * 60_000) {
    console.log(`[SCHEDULE-GUARD] Previous scan was ${Math.round(age / 1000)}s ago; skipping duplicate invocation.`);
    return;
  }

  const [mids, tgState] = await Promise.all([
    fetchMids(),
    readJson(TG_STATE_FILE, { initialized: false, lastStartupAt: 0, lastCycleAt: 0 })
  ]);
  const openDedupe = new Set(state.alertedOpenPositionKeys.map(String));
  const fillDedupe = new Set(state.alertedNewEntryFillKeys.map(String));
  const alerts = [];
  const performanceByWallet = new Map();
  let walletsSucceeded = 0, walletErrors = 0, positionsChecked = 0;
  let inBand = 0, outsideBand = 0, alreadyAlerted = 0, averagingIgnored = 0;
  let alertSendErrors = 0, alertsSent = 0, newEntryCount = 0;

  for (const [trader, address] of WALLETS) {
    try {
      const [currentState, recentFills, historyFills] = await Promise.all([
        fetchCurrentState(address),
        // Independent 24h request protects the daily scorecard from a 30d API cap.
        fetchFills(address, performanceStartTime, now),
        fetchFills(address, historyStartTime, now)
      ]);
      const positions = extractPositions(currentState);

      // Build a 24-hour realized-performance summary from Hyperliquid fills.
      // Keep fills without closedPnl visible as missing data; never guess their PnL.
      const perf = {
        trader, address, entryFills: 0, entryNotional: 0,
        closeFills: 0, wins: 0, losses: 0, breakeven: 0,
        pnl24h: 0, closedNotional: 0, missingPnl: 0,
        historyCloseFills: 0, historyWins: 0, historyLosses: 0, historyPnl: 0
      };
      // Strict 24-hour metrics use their own API query, never the longer history sample.
      for (const fill of recentFills) {
        const fillTime = num(fill?.time);
        if (fillTime < performanceStartTime || fillTime > now) continue;
        if (isNewPositionFill(fill)) {
          perf.entryFills++;
          perf.entryNotional += notional(fill);
        }
        const dir = String(fill?.dir || '').toLowerCase();
        const hasClosedPnl = fill?.closedPnl !== undefined &&
          fill?.closedPnl !== null && Number.isFinite(Number(fill.closedPnl));
        const isCloseFill = dir.includes('close') || dir.includes('closing') || hasClosedPnl;
        if (!isCloseFill) continue;
        perf.closeFills++;
        perf.closedNotional += notional(fill);
        if (!hasClosedPnl) { perf.missingPnl++; continue; }
        const pnl = Number(fill.closedPnl);
        perf.pnl24h += pnl;
        if (pnl > 0) perf.wins++;
        else if (pnl < 0) perf.losses++;
        else perf.breakeven++;
      }
      // Longer-term context is calculated separately and explicitly labelled 30d/sample.
      for (const fill of historyFills) {
        const fillTime = num(fill?.time);
        if (fillTime < historyStartTime || fillTime > now) continue;
        const dir = String(fill?.dir || '').toLowerCase();
        const hasClosedPnl = fill?.closedPnl !== undefined &&
          fill?.closedPnl !== null && Number.isFinite(Number(fill.closedPnl));
        const isCloseFill = dir.includes('close') || dir.includes('closing') || hasClosedPnl;
        if (!isCloseFill) continue;
        perf.historyCloseFills++;
        if (!hasClosedPnl) continue;
        const pnl = Number(fill.closedPnl);
        perf.historyPnl += pnl;
        if (pnl > 0) perf.historyWins++;
        else if (pnl < 0) perf.historyLosses++;
      }
      performanceByWallet.set(address, perf);

      // Alert logic remains on the configured short lookback, not the 24h report window.
      const alertFills = recentFills.filter(fill => {
        const t = num(fill?.time);
        return t >= startTime && t <= now;
      });
      const sortedFills = alertFills.slice().sort((a, b) => num(a.time) - num(b.time));
      const currentKeys = new Set();
      const newEntrySidesThisCycle = new Set();

      // New entry fill alerts: a flat-to-open transition / explicit Open Long/Short fill.
      for (const fill of sortedFills) {
        const before = num(fill?.startPosition);
        const after = postPositionFromFill(fill);
        if (Math.abs(before) > 1e-12 && Math.abs(after) > Math.abs(before) && Math.sign(before) === Math.sign(after)) {
          averagingIgnored++;
        }
        if (!isNewPositionFill(fill)) continue;
        const fillTime = num(fill?.time);
        if (!(fillTime >= startTime && fillTime <= now)) continue;
        const coin = String(fill?.coin || '');
        const side = sideFromFill(fill);
        const entry = num(fill?.px);
        const fillNotional = notional(fill);
        if (!coin || !(entry > 0) || fillNotional < MIN_ALERT_NOTIONAL) continue;
        const eventKey = `${address}|fill|${fillKey(fill)}`;
        newEntrySidesThisCycle.add(`${coin}|${side}`);
        if (fillDedupe.has(eventKey)) continue;
        const livePos = findPosition(positions, coin, side);
        const mark = num(mids?.[coin]);
        alerts.push({
          alertType: 'NEW_ENTRY', trader, address, coin, side, entry, current: mark,
          leverage: num(livePos?.leverage), distancePct: mark > 0 ? Math.abs((mark - entry) / entry) * 100 : null,
          notional: fillNotional, fillTime, fillKey: eventKey
        });
        newEntryCount++;
      }

      // Open positions: alert once per position lifecycle when mark is within 1% (configurable).
      for (const position of positions) {
        const { coin, side, entry } = position;
        const lifecycleKey = `${address}|${coin}|${side}`;
        currentKeys.add(lifecycleKey);
        const mark = num(mids?.[coin]);
        if (!(mark > 0 && entry > 0)) continue;
        const distancePct = Math.abs((mark - entry) / entry) * 100;
        if (distancePct >= ENTRY_BAND_PCT) {
          outsideBand++;
          continue;
        }
        inBand++;
        // Avoid sending a second near-entry alert for the same newly opened position in this cycle.
        if (newEntrySidesThisCycle.has(`${coin}|${side}`)) continue;
        if (openDedupe.has(lifecycleKey)) {
          alreadyAlerted++;
          continue;
        }
        if (num(position.positionValue) < MIN_ALERT_NOTIONAL) continue;
        alerts.push({
          alertType: 'OPEN_BAND', trader, address, coin, side, entry, current: mark,
          leverage: num(position.leverage), distancePct, notional: num(position.positionValue),
          fillTime: null, fillKey: lifecycleKey
        });
      }

      // Remove lifecycle dedupe only when a closed position is observed.
      for (const key of [...openDedupe]) {
        if (key.startsWith(`${address}|`) && !currentKeys.has(key)) openDedupe.delete(key);
      }
      state.wallets[address] = {
        trader, address, checkedAt: now, positions, recentFillCount: fills.length
      };
      positionsChecked += positions.length;
      walletsSucceeded++;
    } catch (error) {
      walletErrors++;
      console.error(`[WATCH][ERROR] ${trader} ${short(address)}: ${error?.message || error}`);
    }
  }

  // First-run startup message.
  if (!tgState.initialized) {
    try {
      await sendStartupStatus();
      tgState.initialized = true;
      tgState.lastStartupAt = now;
    } catch (error) {
      console.error(`[TELEGRAM][STARTUP-ERROR] ${error?.message || error}`);
    }
  }

  // Deliver signals; persist dedupe only after Telegram confirms delivery.
  for (const alert of alerts) {
    try {
      const result = await sendTelegram(formatAlert(alert));
      if (!result.sent) {
        alertSendErrors++;
        continue;
      }
      if (alert.alertType === 'NEW_ENTRY') {
        fillDedupe.add(alert.fillKey);
        state.alertedNewEntryFillKeys = [...fillDedupe].slice(-12000);
      } else {
        openDedupe.add(alert.fillKey);
        state.alertedOpenPositionKeys = [...openDedupe].slice(-6000);
      }
      alertsSent++;
      await writeJson(STATE_FILE, state);
    } catch (error) {
      alertSendErrors++;
      console.error(`[TELEGRAM][ALERT-ERROR] ${alert.trader} ${alert.coin}: ${error?.message || error}`);
    }
  }

  state.version = VERSION;
  state.initialized = true;
  state.lastScanAt = now;
  state.lastRuntimeMs = Date.now() - startedAt;
  state.lastAlerts = alerts.map(a => ({
    alertType: a.alertType, trader: a.trader, address: a.address, coin: a.coin, side: a.side,
    entry: a.entry, current: a.current, distancePct: a.distancePct, fillTime: a.fillTime
  }));
  state.alertedOpenPositionKeys = [...openDedupe].slice(-6000);
  state.alertedNewEntryFillKeys = [...fillDedupe].slice(-12000);
  await writeJson(STATE_FILE, state);

  const runtimeSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  const cycleMessage = [
    '👁️ GFTSH — 28 WALLET OBSERVER',
    '━━━━━━━━━━━━━━━━━━',
    '📡 Status: WATCHING',
    `👥 Wallets checked successfully: ${walletsSucceeded}/${WALLETS.length}`,
    `⏱ Scan interval: ${SCAN_INTERVAL_MIN} minutes`,
    '',
    `🆕 New-entry signals found: ${newEntryCount}`,
    `🔔 Telegram alerts sent: ${alertsSent}`,
    `🔁 Already alerted in current lifecycle: ${alreadyAlerted}`,
    `⚠️ Alert delivery errors: ${alertSendErrors}`,
    `🎯 Open positions inside ${ENTRY_BAND_PCT.toFixed(2)}% band: ${inBand}`,
    `📊 Open positions checked: ${positionsChecked}`,
    `🔄 Averaging/add fills ignored: ${averagingIgnored}`,
    `📏 Open positions outside ${ENTRY_BAND_PCT.toFixed(2)}% band: ${outsideBand}`,
    `❌ Wallet/API errors: ${walletErrors}`,
    '',
    `🕐 Cycle: ${new Date(now).toISOString()}`,
    `⚙️ Runtime: ${runtimeSec}s`,
    '',
    'Alerts: every detected new entry + open positions within the entry band.',
    '🛡 READ-ONLY | NO ORDERS | NO AUTO-COPY'
  ].join('\n');
  try { await sendTelegram(cycleMessage); }
  catch (error) { console.error(`[TELEGRAM][CYCLE-ERROR] ${error?.message || error}`); }

  // Send every 24 elapsed hours (not merely once per UTC calendar date).
  // Wallets with zero trades are normal and never block the report; API coverage
  // must still be complete so a failed request is not misreported as zero activity.
  const lastPerformanceReportAt = num(tgState.lastPerformanceReportAt);
  const reportDue = !lastPerformanceReportAt || (now - lastPerformanceReportAt >= 24 * 60 * 60_000);
  if (reportDue && walletsSucceeded === WALLETS.length) {
    try {
      await sendPerformanceReport(performanceByWallet, now);
      tgState.lastPerformanceReportAt = now;
      tgState.lastPerformanceReportDate = new Date(now).toISOString().slice(0, 10);
      console.log(`[PERFORMANCE-REPORT] sent at=${new Date(now).toISOString()} activeWallets=${[...performanceByWallet.values()].filter(p => p.entryFills > 0 || p.closeFills > 0).length}`);
    } catch (error) {
      console.error(`[PERFORMANCE-REPORT][ERROR] ${error?.message || error}`);
    }
  } else if (reportDue && walletsSucceeded !== WALLETS.length) {
    console.log(`[PERFORMANCE-REPORT][SKIPPED] API coverage incomplete ${walletsSucceeded}/${WALLETS.length}; will retry next cycle`);
  }

  tgState.lastCycleAt = now;
  tgState.lastCycleAlerts = alertsSent;
  tgState.lastCycleAlertSendErrors = alertSendErrors;
  tgState.lastCycleErrors = walletErrors;
  await writeJson(TG_STATE_FILE, tgState);

  console.log(`[CYCLE] wallets=${walletsSucceeded}/${WALLETS.length} positions=${positionsChecked} newEntries=${newEntryCount} inBand=${inBand} sent=${alertsSent} alreadyAlerted=${alreadyAlerted} alertErrors=${alertSendErrors} averagingIgnored=${averagingIgnored} outsideBand=${outsideBand} errors=${walletErrors} runtime=${runtimeSec}s`);
}

main().catch(error => {
  console.error(`[FATAL] ${error?.stack || error}`);
  process.exitCode = 1;
});
