GFTSH 10-WALLET OBSERVER — V2.4.1 ALERT REARM PATCH

Changes:
- Bumps persisted alert-state migration marker from 1 to 2 and clears stale
  open-position dedupe keys ONCE. This allows current positions inside the 1.00%
  entry band to produce detailed Telegram alerts again.
- Keeps the 1.00% band, 10-wallet monitoring, new-entry detection, fill dedupe,
  and READ-ONLY / NO ORDERS / NO AUTO-COPY behavior.
- Cycle report now separates in-band positions, detailed alert candidates queued,
  alerts sent, dedupe skips, and delivery errors.
- Alert timestamp label distinguishes actual new-entry fill time from the time
  an already-open position was detected near entry.

Deployment:
Replace the repository's gftsh_10_wallet_observer.mjs with the included file.
The first run after deployment intentionally re-arms current in-band positions,
so duplicate detailed alerts are possible for positions that were previously
successfully alerted. After that one-time migration, alerts are deduplicated only
when Telegram delivery succeeds.

Safety:
The script only reads public Hyperliquid account data and sends Telegram alerts.
It does not place orders and does not copy trades.

Validation: node --check passed.
