GFTSH Wallet Observer — V3.14.0 (30-wallet roster)

Roster updates in this version:
- Preserves all 9 previous starred priority wallets at positions 1–9.
- Keeps candidate #1 (0x3dd462...) and candidate #6 (0x88250...) and stars both immediately after the prior starred wallets at positions 10–11.
- Keeps prior roster wallets 10–21, re-numbered in labels to match their new positions (12–23).
- Keeps only STRK Candidate 2 at position 24.
- Keeps Intraday Research Candidate 3 at position 25.
- Removes prior candidates 2, 4, 5, 7 and 8.
- Adds five replacement research candidates at positions 26–30.
- Exactly 30 unique valid addresses.

New replacement candidates and public profile snapshots:
26. 0x7e1ad5e2bbe30d6d202e7c41036ea0a07c560be9 — 89.9% win rate, 1,489 round-trips, median hold 6m, +$1.05M aggregate open uPnL, 5 open positions. Source: https://hypersonnar.fr/wallet/0x7e1ad5e2bbe30d6d202e7c41036ea0a07c560be9
27. 0x203f4c410f3c35cead9f35b6de2f66e773d7f26e — 89.6% win rate, 1,889 round-trips, median hold 34m, +$62.3K aggregate open uPnL, 3 open positions. Source: https://hypersonnar.fr/wallet/0x203f4c410f3c35cead9f35b6de2f66e773d7f26e
28. 0x654016a8c9fcf0c4cb7ed6078aba21f7f399f7b7 — 100% win rate over 1,432 round-trips, +$1.85M aggregate open uPnL, 14 open positions; median hold was not available on the page. Source: https://hypersonnar.fr/wallet/0x654016a8c9fcf0c4cb7ed6078aba21f7f399f7b7
29. 0x7c356d5723a70f9d37c01ec7bc62c63e64c98e53 — 82.9% win rate, 949 round-trips, median hold 3h, +$8,612 aggregate open uPnL, 2 open positions, both shown profitable. Source: https://hypersonnar.fr/wallet/0x7c356d5723a70f9d37c01ec7bc62c63e64c98e53
30. 0x95a5baeadae0de1ea16104f5f4c4ff911f4837da — 90.4% win rate, 879 round-trips, median hold 2.9h, 4 open positions, two winners and two losers; aggregate open uPnL was -$2,843, so this one is a weaker replacement and is NOT currently net-profitable on open positions. Source: https://hypersonnar.fr/wallet/0x95a5baeadae0de1ea16104f5f4c4ff911f4837da

Important research caveat:
- These are public analytics snapshots, not guarantees or permanent live states. Open positions and uPnL change. The first four replacements showed positive aggregate open uPnL in their respective public snapshots; the fifth is included as a short-hold/high-win-rate candidate but its aggregate open uPnL was negative at the snapshot. Do not treat all five as fully confirmed winners.
- Candidate #3 was retained at the user's request; its profile snapshot showed 84.6% WR, 1,160 round-trips, 3.1h median hold, and +$4,691 aggregate open uPnL. Source: https://hypersonnar.fr/wallet/0x68a82030ee49af0dd0d1880da1aa18e0e97f003c
- STRK Candidate 2 is retained at the user's request; its public profile showed 67.9% win rate, 944 round-trips and 19h median hold, so it does not match the short-hold preference. Source: https://hypersonnar.fr/wallet/0x0c1f6941fdcde9488dfd36ca16fed6b3bc49672b
- HyperSonnar describes its analytics as public Hyperliquid data and says unknown values are shown as dashes: https://hypersonnar.fr/docs

Behavior:
- Read-only monitoring: no orders and no automatic copying.
- GitHub Actions schedule targets a scan every 5 minutes (GitHub schedules are best-effort).
- Alerts for newly opened positions observed in the lookback window.
- Alerts for currently open positions when mark price is within the configured 1.00% entry band, once per position lifecycle.
- Same-side adds/averages are not treated as new entries.
- Starred wallets receive the existing priority Telegram formatting.

Configuration:
1. Replace the existing worker with exact filename gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml; keep workflow name exactly “GFTSH 10 Wallet Observer”.
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Keep GFTSH_WATCH_WALLETS blank to use the built-in 30-wallet roster.
5. Run workflow_dispatch once, inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch; it has not been installed or runtime-tested on GitHub.
