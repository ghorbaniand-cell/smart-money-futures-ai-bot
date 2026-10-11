GFTSH 30 Wallet Observer — V3.3.0

Included:
- gftsh_10_wallet_observer.mjs (filename intentionally retained)
- .github/workflows/gftsh_10_wallet_observer.yml (workflow name intentionally retained)
- gftsh_10_wallet_observer.env.example

Behavior:
- 30 Hyperliquid perpetual-futures wallets, scanned every 5 minutes by GitHub Actions.
- Alerts on new position-opening fills observed during the lookback window, regardless of distance from entry.
- Alerts once per open-position lifecycle when current mark is within 1.00% of average entry.
- Same-side averaging/add fills do not create new-entry alerts.
- Read-only only: no orders, no auto-copy.
- State files persist between scheduled runs.

Wallet ordering in V3.3.0:
- Slots #1–#5: same five priority wallets retained from the previous version, starred in Telegram.
- Former #18 is now slot #6 and starred.
- Former #25 is now slot #7 and starred.
- The other 16 retained addresses are preserved: former slots #6–#16 and former #24, moved to fill slots #8–#19.
- Former slots not requested for retention were removed.
- Slots #20–#30 are 11 replacement candidates selected from public Hyperliquid analytics based on reported round-trip sample size, positive historical PnL, win rate, recent activity and visible account/position data where available.

Public metrics reviewed (snapshots can change):
- 0x9aca58e24ff5845f245e7c2c897fef1bc59b3555: reported +$859.5k PnL, 74.5% win rate, 1,049 round-trips, 3 open positions; https://hypersonnar.fr/wallet/0x9aca58e24ff5845f245e7c2c897fef1bc59b3555
- 0x8067cd23db56738d1c08fc6225846d2fd4b05261: reported +$21.3k PnL, 97.7% win rate, 1,226 round-trips, 7 open positions; https://hypersonnar.fr/wallet/0x8067cd23db56738d1c08fc6225846d2fd4b05261
- 0xe2823659be02e0f48a4660e4da008b5e1abfdf29: reported +$4.67M PnL and 1,801 round-trips; the reported 100% win rate should be treated cautiously and independently reviewed; https://hypersonnar.fr/wallet/0xe2823659be02e0f48a4660e4da008b5e1abfdf29
- 0x4101ce19ee81f24da894976e585f1e79119dbd93: reported +$357.6k PnL, 80.4% win rate, 530 round-trips and 13 open positions; https://hypersonnar.fr/wallet/0x4101ce19ee81f24da894976e585f1e79119dbd93
- 0xa32533a01bfca623badfaba89fa28c079b8671f7: reported +$255.5k PnL, 80.1% win rate, 1,312 round-trips and 4 open positions; https://hypersonnar.fr/wallet/0xa32533a01bfca623badfaba89fa28c079b8671f7
- 0x69443708e5135532d435b7d1a3b7e6bdc481a800: reported +$32k PnL, 69.9% win rate and 1,125 round-trips; https://hypersonnar.fr/wallet/0x69443708e5135532d435b7d1a3b7e6bdc481a800
- 0x0a506b1e47726e769949086ea60b5b01cbaf956a: reported +$197.7k PnL, 61.6% win rate, 1,013 round-trips and 19 open positions; https://hypersonnar.fr/wallet/0x0a506b1e47726e769949086ea60b5b01cbaf956a
- 0xdb5a7b0728aa0041fe66a4f775c77e559aa81248: reported +$17.9k PnL, 76.2% win rate, 617 round-trips and 2 open positions; https://hypersonnar.fr/wallet/0xdb5a7b0728aa0041fe66a4f775c77e559aa81248
- 0xb69eec8fea0081343c3b09e652ba1fa7dcf7033a: reported +$1.54M PnL, 74.2% win rate and 782 round-trips; the public snapshot also showed significant unrealized losses and high margin usage, so this is a higher-risk watch candidate; https://hypersonnar.fr/wallet/0xb69eec8fea0081343c3b09e652ba1fa7dcf7033a
- 0x096eceb86a9d9a2baa07315464daaa84d0cc07d1: reported +$49.8k PnL, 80.3% win rate, 898 round-trips and 1 open position; the snapshot showed elevated margin usage and negative open PnL, so monitor risk carefully; https://hypersonnar.fr/wallet/0x096eceb86a9d9a2baa07315464daaa84d0cc07d1
- 0x1e0b469b0f10f59bd6c76a010c4b0dd24742b1ef: reported +$964.5k PnL, 98.6% win rate and 804 round-trips; the snapshot showed a materially losing open position and high margin usage, so this candidate is higher risk; https://hypersonnar.fr/wallet/0x1e0b469b0f10f59bd6c76a010c4b0dd24742b1ef

Important:
Public leaderboard/analytics numbers are not guarantees. A high win rate can coexist with large losses, high leverage, negative open PnL or inactive accounts. The 11 replacements are candidates for observation, not endorsements or automated-copy targets. The observer does not place trades. Please recheck current status after installation.

Deployment:
1. Replace the existing file at exact path gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml, keeping workflow name exactly "GFTSH 10 Wallet Observer".
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Keep GFTSH_WATCH_WALLETS blank unless intentionally overriding all 30 addresses.
5. Run workflow_dispatch once to verify API/Telegram, then confirm scheduled runs.
