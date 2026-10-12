GFTSH Wallet Observer — V3.10.0 (30-wallet roster)

Roster organization:
- 30 unique Hyperliquid perpetual-futures wallet addresses.
- The 9 wallets marked as priority are grouped together in positions 1–9.
- The priority grouping reflects the user's observed results; it is not a guarantee of future performance.
- The remaining 21 wallets are listed in positions 10–30.

Behavior:
- Read-only monitoring: no orders and no automatic copying.
- GitHub Actions schedule targets a scan every 5 minutes (GitHub schedules are best-effort).
- Alerts for newly opened positions observed in the lookback window.
- Alerts for currently open positions when mark price is within 1.00% of average entry, once per position lifecycle.
- Same-side averaging/add fills are not treated as new entries.

Configuration:
1. Replace the existing worker with exact filename gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml; keep workflow name exactly “GFTSH 10 Wallet Observer”.
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Keep GFTSH_WATCH_WALLETS blank to use the built-in 30-wallet roster.
5. Run workflow_dispatch once, inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch; it has not been installed or runtime-tested on GitHub.
