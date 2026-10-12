GFTSH Wallet Observer — V3.8.0 (30-wallet roster)

Included files:
- gftsh_10_wallet_observer.mjs (filename intentionally retained)
- .github/workflows/gftsh_10_wallet_observer.yml (workflow name intentionally retained)
- gftsh_10_wallet_observer.env.example

Roster changes:
- Current roster slots 1–19 are preserved exactly and in the same order.
- The existing 8 starred entries within those 19 remain starred.
- The previous entries in slots 20–30 were removed and replaced with 11 new Hyperliquid research candidates.
- All 30 addresses are unique.

New candidates in slots 20–30 (public HyperSonnar snapshots, accessed 2026-10-12; statistics can change):
20. 0x04a97ae7f350a22cd0cdb6b1875e8905b76495aa — 100.0% win rate, 895 trades; reported positive all-time PnL, but open unrealized loss and high margin use were visible.
21. 0xad68fabb1bec8b08c8080ad165ae5bdec64136d6 — 98.9% win rate, about 1,560 trades; positive recent snapshot.
22. 0xfdb03a2574e9e7d1c77d9ed752d99cdf25c3db25 — 98.8%, 949 trades.
23. 0x505f21430e54d4fac9fa456ead8c35cac0b3b70d — 99.9%, 846 trades; recent weekly PnL was negative in the snapshot.
24. 0xc3b1bf1f1e6fb8161ef4dc2f34e2c56f70b94b11 — 97.9%, 953 trades; positive weekly/monthly PnL in the snapshot.
25. 0xfdbaa5eee7cdf45eec3a71a672065a67191fda7a — 83.4%, 723 trades; positive 1D/1W/1M PnL in the snapshot.
26. 0x1e5cf44f64a66dae56104ed91bf15f6147200ac1 — 89.0%, 788 trades; positive weekly PnL and reported +21% 7-day perp ROI.
27. 0xa32533a01bfca623badfaba89fa28c079b8671f7 — 86.3%, 1,208 trades; positive 1D/1W/1M PnL in the snapshot.
28. 0xba67690d19571752e0f845acd48b3349131b723b — 100.0%, 726 trades; positive weekly/monthly PnL in the snapshot.
29. 0xd74916aecd93ca55deb392dfad4c3ae43951ea49 — 84.6%, 1,309 trades; 16 active days out of 28 and positive open uPnL in the snapshot.
30. 0xc330a271b48461b0745879c06a933f42f0f4fc69 — 95.3%, 730 trades; high margin usage and relatively small equity were visible.

Important: a high win rate alone is not enough to prove trading quality. Some candidates have high margin usage, unrealized losses, or negative recent weekly results. The addresses are research candidates to monitor, not guaranteed winners or investment advice. HyperSonnar's own methodology states its score is heuristic and historical performance does not guarantee future results.

Behavior remains read-only: no orders and no auto-copy.
- GitHub Actions scan target: every 5 minutes (best effort).
- Alert on new position-opening fills observed during the lookback window.
- Alert once per open-position lifecycle when mark is within 1.00% of average entry.
- Same-side averaging/add fills do not create new-entry alerts.
- State files persist between scheduled runs.

Configuration:
1. Replace the existing worker with exact filename gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml; keep workflow name exactly “GFTSH 10 Wallet Observer”.
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Keep GFTSH_WATCH_WALLETS blank to use the built-in 30-wallet roster.
5. Run workflow_dispatch once and inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch; it has not been installed or runtime-tested on GitHub.
