# PhotoOrder

Адаптивный веб-сайт для учёта заказов на фото товаров. Kanban-доска, CRUD заказов, загрузка файлов в Cloudinary, экспорт CSV.

## Структура

Монорепозиторий с npm workspaces:
- `client/` — React 18 + Vite + Tailwind CSS
- `server/` — Node.js + Express + Prisma + PostgreSQL

## Команды

```bash
npm install              # установка зависимостей (все workspaces)
npm run dev              # запуск dev-серверов (клиент + сервер)
npm run build            # сборка клиента для продакшена

# Сервер отдельно
cd server
npx prisma migrate dev   # миграция БД
npx prisma db push       # пуш схемы без миграции
npx prisma generate      # генерация клиента
```

## Переменные окружения

### server/.env
- `NODE_ENV` — `production` на VPS
- `HOST` — `127.0.0.1` за nginx, `0.0.0.0` локально
- `PORT` — порт сервера (по умолчанию 3001)
- `DATABASE_URL` — PostgreSQL connection string (локальный postgres на VPS)
- `AUTH_LOGIN` / `AUTH_PASSWORD` — логин и пароль для авторизации
- `JWT_SECRET` — секрет для подписи JWT
- `CORS_ORIGIN` — прод-домен (например `https://example.com`), используется только при `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`

### client
- `VITE_API_BASE_URL` — не требуется при деплое на тот же домен (фронт и API на одном хосте, axios идёт по относительному `/api`)

## Стек

- React 18, Vite, Tailwind CSS, Zustand, React Hook Form + Zod, @dnd-kit, axios, react-hot-toast
- Express, Prisma, PostgreSQL, Cloudinary, jsonwebtoken, csv-stringify

## Авторизация

JWT на базе env-переменных. POST /api/login проверяет credentials, возвращает токен на 7 дней. Все остальные /api/* эндпоинты защищены middleware.

## Деплой

Хостинг — один VPS Ubuntu 22.04/24.04. Стек: nginx (TLS + статика + reverse proxy) → Node.js под PM2 → локальный PostgreSQL. Файлы — Cloudinary.

**DNS:** A-запись домена указывает напрямую на IP VPS. Cloudflare **не используется как proxy** (DNS-only, серый облако), так как Cloudflare proxy严重限速 для российских VPS.

Полная инструкция: [`deploy/INSTALL.md`](deploy/INSTALL.md).

Артефакты деплоя:
- `deploy/nginx.conf` — конфиг сайта (SPA fallback, `/api` → `127.0.0.1:3001`, gzip, sendfile, `client_max_body_size 25M`)
- `deploy/ecosystem.config.cjs` — PM2 (1 fork, autorestart, логи в `logs/`)
- `deploy/deploy.sh` — обновление: `git pull` → `npm ci` → `prisma migrate deploy` → `vite build` → `pm2 reload`

Прод-сервер слушает `127.0.0.1:3001` (наружу не торчит), Postgres — только loopback. SSL — Let's Encrypt через `certbot --nginx`.
