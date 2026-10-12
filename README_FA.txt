GFTSH Wallet Observer — V3.11.0 (30-wallet roster)

Roster organization:
- 30 unique Hyperliquid perpetual-futures wallet addresses.
- The 9 priority wallets are grouped in positions 1–9, based on the user's observed performance.
- Positions 10–20 are retained from the prior roster.
- Position 21 retains the additionally requested wallet.
- Positions 22–24 are three STRK-related research candidates. The public evidence found so far does not prove all three captured both the STRK top/bottom or closed profitable trades; they are included for observation, not endorsed as verified winners.

Behavior:
- Read-only monitoring: no orders and no automatic copying.
- GitHub Actions schedule targets a scan every 5 minutes (GitHub schedules are best-effort).
- Alerts for newly opened positions observed in the lookback window.
- Alerts for currently open positions when mark price is within 1.00% of average entry, once per position lifecycle.
- Same-side averaging/add fills are not treated as new entries.

Configuration:
1. Replace the existing worker with exact filename gftsh_10_wallet_observer.mjs.
2. Replace .github/workflows/gftsh_10_wallet_observer.yml; keep workflow name exactly “GFTSH 10 Wallet Observer”.
3. Ensure GitHub Actions secrets TELEGRAM_TOKEN and TELEGRAM_CHAT_ID are configured.
4. Keep GFTSH_WATCH_WALLETS blank to use the built-in 30-wallet roster.
5. Run workflow_dispatch once, inspect Telegram/API results, then verify scheduled runs.

This ZIP is a local patch; it has not been installed or runtime-tested on GitHub.


نسخه V3.12: تعداد کیف پول‌ها ۳۰ است. کاندید STRK شماره ۲ حفظ شده و دو کاندید دیگر حذف شده‌اند. هشت آدرس جدید به‌عنوان Intraday Candidate اضافه شده‌اند. این آدرس‌ها از رتبه‌بندی عمومی تریدرهای Hyperliquid برای بررسی بیشتر انتخاب شده‌اند؛ سودده بودن پوزیشن باز و مدت نگهداری چندساعته برای هر هشت آدرس در یک snapshot زنده مستقل تأیید نشده و باید در اجرای زنده رصد شوند.
