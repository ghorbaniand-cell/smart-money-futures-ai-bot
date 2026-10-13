GFTSH Wallet Observer — V3.18.0 (30-wallet roster)

Roster updates in this version:
- Removes the former roster entry #21: 0xfeec88b13fc0be31695069f02bac18538a154e9c.
- Promotes the former #22 wallet 0xe5731d975d84c7222ebfd0ce8239f04ea3164e55 into the starred group, beside the other starred wallets.
- Keeps the remaining 27 wallets from V3.17 and adds three research candidates, producing exactly 30 unique addresses.
- All entries are numbered sequentially in the built-in roster; starred wallets are grouped first.
- New research additions: 0xdb42ab87ac1f9f0d6d83dd82ff49137ab70f631d, 0xc3b1bf1f1e6fb8161ef4dc2f34e2c56f70b94b11, and 0xc330a271b48461b0745879c06a933f42f0f4fc69.
- Public snapshots report, respectively: 70.3% win rate, 2.8h median hold and 19 open positions for 0xdb42…; 96.3% win rate and 1.4h median hold for 0xc3b1… (no open positions in that snapshot); and 95.3% win rate, 2.3h median hold and 3 open positions for 0xc330…. The 0xc3b1… profile reported about $1.69M of volume in October through its latest observed data. These are third-party snapshot metrics and may change; not every candidate satisfies every filter equally.
- The research candidates are not proven to predict pumps/dumps or exit at trend tops. Validate their current activity and behavior before relying on alerts.

Behavior:
- Read-only monitoring: no orders and no automatic copying.
- GitHub Actions schedule targets a scan every 5 minutes (GitHub schedules are best-effort).
- Existing-position entry band remains 1.00%.
- Alerts for newly opened positions observed in the lookback window.
- Alerts for currently open positions when mark price is within the configured 1.00% entry band, once per observed position lifecycle.
- Same-side adds/averages are not treated as new entries.
- Starred wallets receive the existing priority Telegram formatting.

Configuration:
1. Replace the existing worker with exact filename gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml; workflow name remains exactly “GFTSH 10 Wallet Observer”.
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Leave GFTSH_WATCH_WALLETS blank/unset to use the built-in 30-wallet roster. The workflow in this ZIP does not override it from repository variables. If deliberately supplying a custom roster, it must contain exactly 30 unique valid addresses.
5. Run workflow_dispatch once, inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch. Syntax and roster checks are performed locally; it has not been installed on GitHub or tested against live Hyperliquid/Telegram APIs.
