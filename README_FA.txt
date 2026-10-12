GFTSH Wallet Observer — V3.15.0 (30-wallet roster)

Roster updates in this version:
- Preserves the 9 previous starred priority wallets at positions 1–9.
- Keeps candidate #1 and #6 starred at positions 10–11.
- Keeps the prior core roster and STRK Candidate 2 unchanged.
- Keeps Intraday Research Candidate 3.
- Removes four prior replacement candidates (previous replacement 1, 2, 3 and 5).
- Keeps prior replacement 4 (0x7c356...) because its public snapshot showed 82.9% win rate, 949 round-trips, 3h median hold and +$8,612 open uPnL across two profitable open positions.
- Adds four new research wallets at the end; exactly 30 unique valid addresses.

New replacement candidates — public HyperSonnar snapshots observed Oct 12, 2026:
1. 0x3a23b10845e911b6944d9dc2f1f480fca3af35d6 — 97.7% win rate (1,050 round-trips), median hold 4.2h, open uPnL +$444.4K across 7 positions. Important risk: margin usage reported at 100.9%, so not a low-risk account. Source: https://hypersonnar.fr/wallet/0x3a23b10845e911b6944d9dc2f1f480fca3af35d6
2. 0xc179e03922afe8fa9533d3f896338b9fb87ce0c8 — 97.5% win rate (2,000 round-trips), open uPnL +$2.48M across 4 positions, margin usage 51.2%; median hold unavailable in the public snapshot, so short-holding behavior is not confirmed. Source: https://hypersonnar.fr/wallet/0xc179e03922afe8fa9533d3f896338b9fb87ce0c8
3. 0xbac48231e71d5e24735d3cb6a26e597b13062979 — 100% reported win rate (1,117 round-trips), open uPnL +$274.1K on one position. Median hold 11h and margin usage 113.6%, so it does not fully meet the short-hold / conservative-risk preference. Source: https://hypersonnar.fr/wallet/0xbac48231e71d5e24735d3cb6a26e597b13062979
4. 0xf08208e088f89970068dc0b2deaa440f6a7d0250 — open uPnL +$31.2K in the observed snapshot, but 48.4% win rate; included only as a lower-confidence research monitor, NOT as a confirmed high-win-rate trader. Source: https://hypersonnar.fr/wallet/0xf08208e088f89970068dc0b2deaa440f6a7d0250

Important transparency note:
- I could verify profitable open positions for three new wallets, but their short-holding condition is not uniformly confirmed; the fourth has a materially lower win rate. These caveats are explicit rather than claiming all four meet every criterion.
- Public analytics snapshots can change quickly. This ZIP does not guarantee the positions remain open or profitable when GitHub runs.
- STRK Candidate 2 is retained at the user's request; its earlier profile showed about 67.9% win rate, 944 round-trips and 19h median hold, so it does not match the short-hold preference.

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
