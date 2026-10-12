GFTSH Wallet Observer — V3.13.0 (30-wallet roster)

Roster organization:
- 30 unique Hyperliquid perpetual-futures wallet addresses.
- The 9 priority wallets are grouped in positions 1–9, based on the user's observed performance.
- Positions 10–20 are retained from the prior roster.
- Position 21 retains the additionally requested wallet.
- Position 22 retains STRK Candidate 2 (0x0c1f...); its public profile showed 67.9% win rate, 944 round-trips and 19h median hold, so it does NOT meet the short-hold filter. It is retained only because the user explicitly asked to keep it.
- Positions 23–30 replace the previous unsupported candidates with wallets selected from public HyperSonnar profile pages. Metrics below are the public page snapshots found during research, not guarantees or a permanent live state.

Research candidates (positions 23–30):
23. 0x3dd462347e7b42b5a3ea15132b677a4978af7a81 — 98.5% WR, 1,096 round-trips, median hold 6m, +$567.3k all-time PnL, +$1,303 open uPnL, 3 open positions. Profile snapshot: https://hypersonnar.fr/wallet/0x3dd462347e7b42b5a3ea15132b677a4978af7a81
24. 0xc330a271b48461b0745879c06a933f42f0f4fc69 — 95.3% WR, 730 round-trips, median hold 2.3h, +$19.3k all-time PnL, 3 open positions; aggregate open uPnL was -$9.76 although two positions showed small positive uPnL. Profile: https://hypersonnar.fr/wallet/0xc330a271b48461b0745879c06a933f42f0f4fc69
25. 0x68a82030ee49af0dd0d1880da1aa18e0e97f003c — 84.6% WR, 1,160 round-trips, median hold 3.1h, +$123.5k all-time PnL, +$4,691 aggregate open uPnL, 2 open positions (one open winner and one open loser). Profile: https://hypersonnar.fr/wallet/0x68a82030ee49af0dd0d1880da1aa18e0e97f003c
26. 0xdb42ab87ac1f9f0d6d83dd82ff49137ab70f631d — 70.3% WR, 1,365 round-trips, median hold 2.8h, +$119.5k all-time PnL, +$206 open uPnL, 19 open positions. Profile: https://hypersonnar.fr/wallet/0xdb42ab87ac1f9f0d6d83dd82ff49137ab70f631d
27. 0x69443708e5135532d435b7d1a3b7e6bdc481a800 — 69.9% WR, 1,125 round-trips, median hold 3.7h, +$32.0k all-time PnL, +$14.68 open uPnL, 3 open positions; recent activity page showed 14 active days out of 15 and 172 trades in one monthly snapshot. Profile: https://hypersonnar.fr/wallet/0x69443708e5135532d435b7d1a3b7e6bdc481a800
28. 0x88250cf2f6402e856bc85fc65095e4a48bb12cb7 — 80.1% WR, 1,337 round-trips, median hold 3.7h, +$222.5k all-time PnL, 39 open positions. The page showed several open winners and some losers, but aggregate open uPnL was unavailable; this is a weaker confirmation. Profile: https://hypersonnar.fr/wallet/0x88250cf2f6402e856bc85fc65095e4a48bb12cb7
29. 0x0e73ca2bed8f84ba0cf139aa96ae3927e77b066e — 86.7% WR, 249 round-trips, median hold 8.7h, +$1,386 all-time PnL, +$18.38 open uPnL, 1 open position. Lower activity and longer hold than preferred. Profile: https://hypersonnar.fr/wallet/0x0e73ca2bed8f84ba0cf139aa96ae3927e77b066e
30. 0xd74916aecd93ca55deb392dfad4c3ae43951ea49 — 84.6% WR, 1,309 round-trips, median hold 12h, +$496.5k all-time PnL, +$12.4k open uPnL, 1 open position. This is a deliberate fallback for profitable-open-position evidence but DOES NOT meet the short-hold requirement. Profile: https://hypersonnar.fr/wallet/0xd74916aecd93ca55deb392dfad4c3ae43951ea49

Important honesty note:
- The public analytics pages report changing positions and some pages may be stale or partially unavailable. These are better-researched candidates, but not all 8 meet every requested filter. In particular, candidates 24, 28 and 30 have a caveat (aggregate open PnL slightly negative / unavailable / median hold too long). Candidate 29 also has a median hold of 8.7h, longer than the preferred few-hour target. Do not describe all eight as fully verified winners. A stricter list would currently have fewer than eight candidates based on the evidence available.
- HyperSonnar explains that it tracks public Hyperliquid data and displays unknown values as dashes when not available: https://hypersonnar.fr/docs

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
