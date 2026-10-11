GFTSH Wallet Observer — V3.6.0

This is a READ-ONLY Hyperliquid perpetual-futures observer. It places no orders and does not copy trades.

Roster rules:
- 30 unique wallet addresses total.
- Original wallets #1–#19 are retained.
- Original wallet #22 is moved to slot #1 and remains starred.
- Original wallet #23 is retained.
- The other seven original entries from #20–#30 are removed.
- Nine additional research candidates are appended as slots #22–#30 and are NOT starred.
- Total starred wallets: 8 (the original seven starred wallets plus original #22).

Observer behavior:
- Scans every 5 minutes via GitHub Actions schedule (best effort).
- Open-position alert band: 1.00% from average entry.
- Read-only; no orders, no auto-copy.
- Keep GFTSH_WATCH_WALLETS blank to use the built-in 30-wallet roster.
- Required GitHub secrets: TELEGRAM_TOKEN and TELEGRAM_CHAT_ID.

The nine added wallets are research candidates based on public HyperSonnar snapshots, not guaranteed winners. Public metrics are historical and snapshots can be stale; several candidates have meaningful risk flags (e.g. high margin usage or an emptied account). Re-evaluate activity, realized PnL, unrealized PnL, margin use and drawdown before treating any as proven top performers.

Files:
- gftsh_10_wallet_observer.mjs (worker filename intentionally unchanged)
- .github/workflows/gftsh_10_wallet_observer.yml (workflow name intentionally unchanged)
- gftsh_10_wallet_observer.env.example
