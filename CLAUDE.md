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
- `DATABASE_URL` — PostgreSQL connection string (Supabase)
- `AUTH_LOGIN` / `AUTH_PASSWORD` — логин и пароль для авторизации
- `JWT_SECRET` — секрет для подписи JWT
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `PORT` — порт сервера (по умолчанию 3001)

### client
- `VITE_API_BASE_URL` — URL бэкенда (для продакшена, при деплое на Vercel)

## Стек

- React 18, Vite, Tailwind CSS, Zustand, React Hook Form + Zod, @dnd-kit, axios, react-hot-toast
- Express, Prisma, PostgreSQL, Cloudinary, jsonwebtoken, csv-stringify

## Авторизация

JWT на базе env-переменных. POST /api/login проверяет credentials, возвращает токен на 7 дней. Все остальные /api/* эндпоинты защищены middleware.

## Деплой

- Frontend: Vercel (cd client && vite build)
- Backend: Render (node server/src/index.js)
- БД: Supabase (PostgreSQL)
- Файлы: Cloudinary (signed upload)
