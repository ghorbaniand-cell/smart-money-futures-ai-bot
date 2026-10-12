GFTSH Wallet Observer — V3.17.0 (28-wallet roster)

Roster updates in this version:
- Preserves all 24 entries from V3.16.
- Adds four distinct research candidates: 0xe31501c472d557bfa145ce105d325fb2dd4cb867, 0xf9077a163e94bfd5a7266b6dd3a39c030e0d89f3, 0xe6503009ee1a648c3775b6b8444afdddb786f1a9, and 0xf179326c91d7233ae833d668c5d44c6a7d472161.
- The last of these (0xf179326c91d7233ae833d668c5d44c6a7d472161) is starred and placed with the other starred wallets.
- Duplicate validation confirms 28 unique, syntactically valid wallet addresses.
- The four additions are research candidates based on public leaderboard snapshots, not proven pump/dump timing winners.

Behavior:
- Read-only monitoring: no orders and no automatic copying.
- GitHub Actions schedule targets a scan every 5 minutes (GitHub schedules are best-effort).
- Existing-position entry band remains 1.00%.
- Alerts for newly opened positions observed in the lookback window.
- Alerts for currently open positions when mark price is within the configured 1.00% entry band, once per observed position lifecycle.
- Same-side adds/averages are not treated as new entries.
- Starred wallets receive the existing priority Telegram formatting.

Configuration:
1. Replace the existing worker with exact filename gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml; workflow name remains exactly “GFTSH 10 Wallet Observer”.
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Leave GFTSH_WATCH_WALLETS blank/unset to use the built-in 28-wallet roster. The workflow in this ZIP does not override it from repository variables. If deliberately supplying a custom roster, it must contain exactly 28 unique valid addresses.
5. Run workflow_dispatch once, inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch. It has not been installed on GitHub or tested against live Hyperliquid/Telegram APIs.
