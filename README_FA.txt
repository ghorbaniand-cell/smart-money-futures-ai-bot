GFTSH 30 Wallet Observer — V3.1.0

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
Retained exactly at their previous numbered slots: #5, #7, #8, #11, #13, #15, #16, #17, #19, #21, and #30. The other 19 slots were replaced using public Hyperliquid trader analytics/leaderboards, prioritizing substantial trade history, reported win rate, and positive historical PnL where visible. These are candidates for observation, not guaranteed profitable traders or copy recommendations. Metrics may be incomplete, methodology-dependent, or change over time; exceptionally high win rates can also reflect small recent round-trip samples.

Deployment:
1. Replace the existing file at the exact path gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml, keeping the workflow name exactly "GFTSH 10 Wallet Observer".
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Ensure the production environment variables used by the workflow are configured. GFTSH_WATCH_WALLETS should be blank unless intentionally overriding all 30 addresses.
5. Run workflow_dispatch once to verify API and Telegram delivery; then confirm automatic scheduled runs.
