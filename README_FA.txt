GFTSH Hyperliquid Wallet Observer — V3.21.0 (28-wallet roster update)

Roster changes in this patch
- Removed current V3.20 entries #29, #30 and #31.
- Starred current V3.20 entry #26 and moved it beside the existing starred wallets at the top.
- Preserved all other wallets. Labels are renumbered sequentially after grouping starred wallets first.
- Final roster: 28 unique addresses.

Research note
- STRK/PONS wallet-specific evidence in the roster came from public position snapshots. Open-position PnL is not the same as realized profit, and a snapshot does not prove repeatable timing or future profitability.
- Wallets remain observation-only candidates, not endorsements or automated-copy targets.

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
4. Leave GFTSH_WATCH_WALLETS blank/unset to use the built-in roster. If supplying a custom roster, it must contain exactly 28 unique valid addresses.
5. Run workflow_dispatch once and inspect the run logs and Telegram delivery. Verify subsequent scheduled runs.

Local checks: JavaScript syntax, roster count, address format and uniqueness. This ZIP has not been installed on GitHub and has not been live-tested against Hyperliquid or Telegram.
