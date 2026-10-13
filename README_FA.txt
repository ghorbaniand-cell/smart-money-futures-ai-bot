GFTSH Hyperliquid Wallet Observer — V3.19.0 (39-wallet research roster)

Roster changes requested
- Starred the former V3.18 roster entries #15, #19, #23, #24 and #25, then grouped them with the existing starred traders at the top. Labels are sequentially renumbered.
- Removed the former V3.18 entries #17, #28, #29 and #30.
- Kept the other V3.18 addresses.
- Added 13 distinct token-specific short-position research candidates identified from public Hyperliquid position snapshots for STRK and PONS. The PONS candidates are the larger visible open shorts with entry prices above the snapshot mark; the STRK candidates are visible open shorts with entry prices above the snapshot mark. One wallet appears across both markets and is included only once. Final roster: 39 unique addresses.

Important research limitation
- Most of the market-specific PnL evidence available in the public pages is unrealized PnL on open positions, not realized profit from closed shorts. Some PONS wallets also have separately reported positive realized PnL on PONS over the reported 7-day window. These metrics are snapshots and can change quickly.
- I did not add a W wallet as a proven profitable short: the accessible snapshot showed the visible large W shorts losing at the time, and the W price had rebounded sharply.
- I did not add a KORU wallet as a proven profitable short: the available public market-specific sample was too thin to establish a meaningful profitable short trader. It is safer not to invent or infer a winning short from an abbreviated address or an unverified side.
- These candidates are for observation and manual verification only; they are not proof of repeatable early entry, timely exits, or future profitability.

Behavior/configuration preserved
- Hyperliquid only; read-only. No orders and no auto-copy.
- GitHub Actions schedule targets every 5 minutes (GitHub schedules are best-effort).
- Entry band remains 1.00%.
- Alerts for newly opened positions observed in the lookback window, plus open positions inside the configured entry band.
- Same-side adds/averages are not treated as new entries; lifecycle deduplication is retained.
- Starred wallets retain priority formatting in Telegram.
- Exact worker filename remains gftsh_10_wallet_observer.mjs.
- Exact workflow name remains GFTSH 10 Wallet Observer.

Install
1. Replace gftsh_10_wallet_observer.mjs with the file in this ZIP.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml with the file in this ZIP.
3. Ensure TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured as GitHub Actions secrets.
4. Leave GFTSH_WATCH_WALLETS blank/unset to use the built-in roster. If supplying a custom roster, it must contain exactly 39 unique valid addresses.
5. Run workflow_dispatch once and inspect the run logs and Telegram delivery. Verify subsequent scheduled runs.

Local checks: JavaScript syntax, roster count, address format and uniqueness. This ZIP has not been installed on GitHub and has not been live-tested against Hyperliquid or Telegram.
