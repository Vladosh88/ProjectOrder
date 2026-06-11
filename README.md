# PhotoOrder — Kanban-доска для фотографа

Адаптивный веб-сайт для учёта заказов на фотосъёмку товаров.

## Возможности

- Kanban-доска с колонками «В работе» / «Готово»
- Drag-and-drop карточек (десктоп)
- Создание, просмотр, редактирование, удаление заказов
- Загрузка фото/видео в Cloudinary
- Поиск по названию и коду, фильтры по статусу и просрочке
- Экспорт всех заказов в CSV
- Тёмная тема
- Адаптивная вёрстка (мобильный/планшет/десктоп)
- Авторизация через JWT

## Быстрый старт (локально)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Vladosh88/ProjectOrder.git
cd ProjectOrder
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить переменные окружения

Скопировать `server/.env.example` в `server/.env` и заполнить:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
AUTH_LOGIN="admin"
AUTH_PASSWORD="your-password"
JWT_SECRET="random-secret-string"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Настроить базу данных

```bash
cd server
npx prisma db push
```

### 5. Запустить

```bash
cd ..
npm run dev
```

Клиент: http://localhost:5173
Сервер: http://localhost:3001

## Деплой

### Frontend → Vercel

1. Подключить репозиторий
2. Root Directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_BASE_URL` = URL бэкенда на Render

### Backend → Render

1. New Web Service → подключить репозиторий
2. Root Directory: `server`
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `node src/index.js`
5. Environment Variables: все из `.env.example`

### БД → Supabase

1. Создать проект на supabase.com
2. Settings → Database → Connection string (URI)
3. Подставить в `DATABASE_URL`
4. Выполнить `npx prisma db push` из папки `server/`

### Cloudinary

1. Зарегистрироваться на cloudinary.com
2. Dashboard → Cloud Name, API Key, API Secret
3. Подставить в переменные окружения бэкенда

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Hook Form, Zod, @dnd-kit, axios |
| Backend | Node.js, Express, Prisma, PostgreSQL, Cloudinary SDK, jsonwebtoken |
| Хостинг | Vercel (фронт), Render (бэк), Supabase (БД), Cloudinary (файлы) |
