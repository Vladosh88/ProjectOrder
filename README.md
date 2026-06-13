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

Для локальной разработки в `server/.env` ставь `HOST=0.0.0.0` (или не задавай — сервер сам возьмёт `0.0.0.0`) и `NODE_ENV=development`. На VPS — `HOST=127.0.0.1` и `NODE_ENV=production`.

## Деплой

Один VPS Ubuntu 22.04/24.04: nginx + PM2 + PostgreSQL + Let's Encrypt.

Полная инструкция — [`deploy/INSTALL.md`](deploy/INSTALL.md).

Кратко:

1. Установить Node 20, PostgreSQL 16, nginx, certbot, PM2.
2. Клонировать репозиторий в `/var/www/photoorder`, заполнить `server/.env`.
3. `npm ci` → `npx prisma migrate deploy` → `npm run build -w client`.
4. `pm2 start deploy/ecosystem.config.cjs` + `pm2 save` + `pm2 startup`.
5. Скопировать `deploy/nginx.conf` в `/etc/nginx/sites-available/`, заменить `YOUR_DOMAIN`, активировать.
6. `sudo certbot --nginx -d your-domain.tld`.

Обновление: `bash deploy/deploy.sh` (`git pull` → сборка → `pm2 reload`).

### Cloudinary

1. Зарегистрироваться на cloudinary.com
2. Dashboard → Cloud Name, API Key, API Secret
3. Подставить в переменные окружения бэкенда

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Hook Form, Zod, @dnd-kit, axios |
| Backend | Node.js, Express, Prisma, PostgreSQL, Cloudinary SDK, jsonwebtoken |
| Хостинг | Ubuntu VPS (nginx + PM2 + PostgreSQL), Cloudinary (файлы) |
