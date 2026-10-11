GFTSH 30 Wallet Observer — V3.0.0

Included:
- gftsh_10_wallet_observer.mjs (filename intentionally retained)
- .github/workflows/gftsh_10_wallet_observer.yml (workflow name intentionally retained)
- gftsh_10_wallet_observer.env.example

Behavior:
- 30 Hyperliquid perpetuals wallets, scanned on a 5-minute GitHub Actions schedule.
- Alerts on new position-opening fills observed during the lookback window, regardless of distance from entry.
- Alerts once per open-position lifecycle when current mark is within 1.00% of the current average entry.
- Same-side averaging/add fills do not create new-entry alerts.
- Read-only only: no orders, no auto-copy.
- Existing-position alert keys and new-fill keys are persisted between scheduled runs.

Wallet selection caveat:
Wallets 1–10 are the user's existing watchlist. Wallets 11–20 are the previously proposed MirrorTrade candidates. Wallets 21–30 are additional public Hyperliquid leaderboard candidates. These are watchlist candidates for the user's manual analysis, not guaranteed profitable traders or copy recommendations. Some public-ranking metrics can be incomplete or change over time.

Deployment:
1. Replace the existing file at the exact path gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml, keeping the workflow name exactly "GFTSH 10 Wallet Observer".
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Ensure the production environment variables used by the workflow are configured. GFTSH_WATCH_WALLETS should be blank unless intentionally overriding all 30 addresses.
5. Run workflow_dispatch once to verify API and Telegram delivery; then confirm automatic scheduled runs.
