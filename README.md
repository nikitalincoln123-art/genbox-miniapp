# LincolnGenerator

Мини-апп для Telegram: генератор эксклюзивных свободных юзернеймов, «Создать стикер» и Unicode-шрифты.

## Деплой

**1. GitHub Pages** (статика, без проверки юзернеймов):
- Сайт уже опубликован на `https://<user>.github.io/genbox-miniapp/`.

**2. Vercel** (нужен для реальной проверки занятости юзернейма):
- Импортируй репозиторий на https://vercel.com/new
- Framework: **Other** (статическая + serverless-функции)
- После импорта добавь переменную окружения:
  - **TG_BOT_TOKEN** — токен бота из @BotFather (опционально, но без него проверка работает только если Vercel-сервер достучится до t.me)

Итоговый URL мини-аппа: `https://<project>.vercel.app`

## Настройка бота в Telegram
1. @BotFather → `/newbot` → получи токен
2. `/setmenubutton` (или Bot Settings → Menu Button) → укажи URL приложения
3. Открой `https://t.me/<твой_бот>` → кнопка меню запустит мини-апп

## Оплата стикеров (Telegram Stars, опционально)
- BotFather → `/mybots` → бот → Payments → Telegram Stars
- Создай инвойс через Bot API `createInvoiceLink` (валюта XTR) и вставь URL в `TG_PAY_CONFIG.invoiceUrl` в `index.html`

## Локальная проверка функции
```
cd api
npm i -g vercel
vercel dev
curl "http://localhost:3000/api/check-username?username=durov"
```