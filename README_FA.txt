GFTSH Wallet Observer — V3.7.0 (30-wallet roster)

Included files:
- gftsh_10_wallet_observer.mjs (filename intentionally retained)
- .github/workflows/gftsh_10_wallet_observer.yml (workflow name intentionally retained)
- gftsh_10_wallet_observer.env.example

Roster requested:
- All 21 wallets from the corrected V3.5 roster are preserved unchanged and in the same order.
- The original #22 wallet remains at slot #1 and starred; the existing seven starred wallets remain starred: 8 starred wallets total.
- Nine new Hyperliquid wallets are appended as slots #22–#30. Public snapshots show historical win rates around 89.9%–99.7% and positive historical realized PnL.
- No old roster wallets were removed; all 30 addresses are unique.

New research candidates (historical snapshots, subject to change):
22. 0x7e1ad5e2bbe30d6d202e7c41036ea0a07c560be9 — 89.9% win rate, approx. +$3.27M perp PnL, 1,489 round-trips.
23. 0xf517639a8872e756ac98d3c65507d2ebc25cc032 — 99.7%, approx. +$130.9k, 1,181 round-trips.
24. 0xc1791da88cc94c9a39e606d8760183d21268dcbb — 90.4%, approx. +$13.7k, 1,081 round-trips.
25. 0xd142479997958a4fefd1f8d5373b31ce36987d73 — 91.5%, approx. +$956.1k, 1,227 round-trips.
26. 0x547115095b2c969071e5e4034eb73759afe591d3 — 91.7%, approx. +$68.4k, 1,099 round-trips.
27. 0xdc5289909be4f3ce2604806bdd1448fd307f19f5 — 92.0%, approx. +$199.6k, 740 round-trips.
28. 0x1e5cfdb85df658a344b837344ea661bdd4c41692 — 92.2%, approx. +$166.1k, 772 round-trips.
29. 0x81f6b887657b679d9e23153ffcd703e111010240 — 91.8%, approx. +$236.9k, 1,029 round-trips.
30. 0x302984eb88bc69dec2c984952895a08e499e79ab — 91.6%, approx. +$63.9k, 655 round-trips.

Caution: a high win rate alone is not enough to prove profitability. Some historical snapshots show emptied futures accounts, high margin use, or substantial unrealized PnL. Treat these as research candidates, not guaranteed winners; review recent performance and risk before relying on them. Metrics are from public HyperSonnar snapshots and can change.

Behavior remains read-only: no orders and no auto-copy.
- Scan every 5 minutes through GitHub Actions (best effort).
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
