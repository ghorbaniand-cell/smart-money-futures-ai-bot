import fs from 'node:fs/promises';
import path from 'node:path';

/*
 * GFTSH — 30 WALLET LIVE FUTURES OBSERVER
 * READ ONLY | NO ORDERS | NO AUTO-COPY
 *
 * Scans 30 fixed Hyperliquid perpetual-futures accounts every 5 minutes.
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

const VERSION = 'GFTSH-30W-LIVE-OBSERVER-V3.15.0-VERIFIED-REPLACEMENTS-1PCT';
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
  ['⭐ Priority Trader 1 ⭐', '0xe2823659be02e0f48a4660e4da008b5e1abfdf29'],
  ['⭐ Priority Trader 2 ⭐', '0x909eb3d5ff0ac0df12c81f8495860cfccf1e7ea9'],
  ['⭐ Priority Trader 3 ⭐', '0x8efa981f60384083496148b55361a83edc268295'],
  ['⭐ Priority Trader 4 ⭐', '0x8bae3527e5a33fa0cf184f37bc112d071463ab6d'],
  ['⭐ Priority Trader 5 ⭐', '0x53f8f390fd4f70941c5d160a964f6893c8dbceff'],
  ['⭐ Priority Trader 6 ⭐', '0xf9faba57a81d1575d3e506dd3eafe7db6f2a3275'],
  ['⭐ Priority Trader 7 ⭐', '0xc0b2a1ce425d0cd8bc321c445fa6ae0eaed2e688'],
  ['⭐ Priority Trader 8 ⭐', '0xce508465b243216fcf372d3146fd62e8f7a7b8e2'],
  ['⭐ Priority Trader 9 ⭐', '0xfdbaa5eee7cdf45eec3a71a672065a67191fda7a'],
  ['⭐ Intraday Research 1 ⭐', '0x3dd462347e7b42b5a3ea15132b677a4978af7a81'],
  ['⭐ Intraday Research 6 ⭐', '0x88250cf2f6402e856bc85fc65095e4a48bb12cb7'],
  ['Trader 12', '0x19f5c3bc2e0978d9a1da389d7d4cfe33cd770fe9'],
  ['Trader 13', '0x736850ee773ac6170fcaeda596514269b863ee56'],
  ['Trader 14', '0x95da8596c44dd09f4b8becce87ad3b7894fb2328'],
  ['Trader 15', '0x4bafc8eca50fc3208fb2520a2a49980768ec60f6'],
  ['Trader 16', '0x36ac01de9bc76c0d744b38c3e13a0538d55c7568'],
  ['Trader 17', '0x1081e214bd6f0137234b92432d9b6033b88965b7'],
  ['Trader 18', '0x24555b39d91e53c4c7811219ece75b15fd9eabc3'],
  ['Trader 19', '0xde0e9b1a35322a809165d09f0490cca3fa7562e5'],
  ['Trader 20', '0xfeec88b13fc0be31695069f02bac18538a154e9c'],
  ['Trader 21', '0xe5731d975d84c7222ebfd0ce8239f04ea3164e55'],
  ['Trader 22', '0xbd334a55db91617545e8d1b09941e036ad8e4200'],
  ['Trader 23', '0x767f6dcea7e1d520a3b7ac251b30178a79eb2ab0'],
  ['STRK Candidate 2', '0x0c1f6941fdcde9488dfd36ca16fed6b3bc49672b'],
  ['Intraday Research 3 — 84.6% WR, 3.1h hold', '0x68a82030ee49af0dd0d1880da1aa18e0e97f003c'],
  ['Intraday Candidate — 82.9% WR, 3h hold, open uPnL positive at snapshot', '0x7c356d5723a70f9d37c01ec7bc62c63e64c98e53'],
  ['Intraday Replacement A — 97.7% WR, 4.2h hold, open uPnL +$444k snapshot; high margin risk', '0x3a23b10845e911b6944d9dc2f1f480fca3af35d6'],
  ['Intraday Replacement B — 97.5% WR, 2000 trades, open uPnL +$2.48M snapshot; median hold unavailable', '0xc179e03922afe8fa9533d3f896338b9fb87ce0c8'],
  ['Intraday Replacement C — 100% WR, 1117 trades, open uPnL +$274k snapshot; 11h median hold/high margin risk', '0xbac48231e71d5e24735d3cb6a26e597b13062979'],
  ['Intraday Replacement D — open uPnL +$31.2k snapshot, but only 48.4% WR; lower-confidence monitor only', '0xf08208e088f89970068dc0b2deaa440f6a7d0250']
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
  if (out.length !== 30) {
    throw new Error(`Expected exactly 30 unique valid wallet addresses; got ${out.length}. Check GFTSH_WATCH_WALLETS.`);
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
    '👁️ GFTSH — 30 WALLET OBSERVER',
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

async function main() {
  const startedAt = Date.now();
  const now = Date.now();
  const startTime = Math.max(0, now - LOOKBACK_MIN * 60_000);
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
  let walletsSucceeded = 0, walletErrors = 0, positionsChecked = 0;
  let inBand = 0, outsideBand = 0, alreadyAlerted = 0, averagingIgnored = 0;
  let alertSendErrors = 0, alertsSent = 0, newEntryCount = 0;

  for (const [trader, address] of WALLETS) {
    try {
      const [currentState, fills] = await Promise.all([
        fetchCurrentState(address),
        fetchFills(address, startTime, now)
      ]);
      const positions = extractPositions(currentState);
      const sortedFills = fills.slice().sort((a, b) => num(a.time) - num(b.time));
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
    '👁️ GFTSH — 30 WALLET OBSERVER',
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
