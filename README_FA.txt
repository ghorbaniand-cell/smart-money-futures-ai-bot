GFTSH Wallet Observer — V3.16.0 (24-wallet roster)

Roster updates in this version:
- Preserves the 9 original starred priority wallets at positions 1–9.
- Keeps Intraday Research 1 and Intraday Research 6 starred.
- Adds STRK Candidate 2 (0x0c1f6941fdcde9488dfd36ca16fed6b3bc49672b) to the starred group.
- Removes exactly these six wallet entries requested by the user: 0x68a82030ee49af0dd0d1880da1aa18e0e97f003c, 0x7c356d5723a70f9d37c01ec7bc62c63e64c98e53, 0x3a23b10845e911b6944d9dc2f1f480fca3af35d6, 0xc179e03922afe8fa9533d3f896338b9fb87ce0c8, 0xbac48231e71d5e24735d3cb6a26e597b13062979, and 0xf08208e088f89970068dc0b2deaa440f6a7d0250.
- Leaves 24 unique valid addresses after the six removals; no new replacement wallets were added in this change.

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
4. Keep GFTSH_WATCH_WALLETS blank to use the built-in 24-wallet roster, or supply exactly 24 unique valid addresses.
5. Run workflow_dispatch once, inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch; it has not been installed or runtime-tested on GitHub.
