GFTSH Wallet Observer — V3.9.0 (30-wallet roster)

Included files:
- gftsh_10_wallet_observer.mjs (filename intentionally retained)
- .github/workflows/gftsh_10_wallet_observer.yml (workflow name intentionally retained)
- gftsh_10_wallet_observer.env.example

Roster changes:
- Slots 1–19 are preserved exactly, in the same order, from V3.8.
- Only the previous V3.8 slots 24 and 25 are retained from the old added range.
- Former slot 25 (0xfdbaa5eee7cdf45eec3a71a672065a67191fda7a) is now starred.
- The other former V3.8 additions were removed and 9 new research candidates were added.
- Total: 30 unique wallet addresses. There are 9 starred entries (the previous 8 plus the starred former slot 25).

New research candidates added after the retained entries (public HyperSonnar snapshots accessed 2026-10-12; metrics may change):
- 0x9db82c502472d76742fdd69609dfcc6e01327401 — 86.4% win rate; 1,176 lifetime round-trips shown in leaderboard; active 90/92 days in recent snapshot. Current live position data was pending on the profile.
- 0xd350958b84c64d25652b3a2a92c9509a6c0125a0 — 96.1% win rate; 180 round-trips in recent months; active 74/91 days.
- 0xf4939e64793fc85b68ec4ddb1697b01db3977134 — 97.5% win rate; 633 trades; recent 7-day result/ROI was negative in snapshot.
- 0x9b864dde6ed1c21608b1665a0ac0faa4f7e36e6e — 95.1% win rate; 1,155 trades; high margin use was visible despite positive unrealized PnL.
- 0xaeace0cf7ec951a708de14a335bea8c1e810d11d — 90.1% win rate; 1,045 trades; perp account was empty in snapshot, so current activity is not established.
- 0xd142479997958a4fefd1f8d5373b31ce36987d73 — 91.5% win rate; 1,227 trades; margin use above 100% in snapshot.
- 0x767f6dcea7e1d520a3b7ac251b30178a79eb2ab0 — 91.6% win rate; 640 trades; small equity and high margin use in snapshot.
- 0xdc5289909be4f3ce2604806bdd1448fd307f19f5 — 92.0% win rate; 740 trades; high margin use in snapshot.
- 0x302984eb88bc69dec2c984952895a08e499e79ab — 91.6% win rate; 655 trades; perp account was empty in snapshot.

These are candidates for read-only monitoring, not guaranteed winners. A high win rate can coexist with negative expectancy, large losses, stale/inactive accounts, or dangerous margin use. Do not treat the list as an endorsement to copy trades.

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
