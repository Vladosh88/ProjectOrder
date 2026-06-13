# Установка PhotoOrder на Ubuntu VPS

Инструкция для чистой Ubuntu 22.04 / 24.04 LTS. Все команды выполняются от root.

Стек на сервере: nginx (reverse proxy + статика) → Node.js 20 LTS под PM2 → PostgreSQL 16. TLS — Let's Encrypt через certbot.

Допущения: домен уже куплен, A-запись смотрит на IP VPS. Подключение по ssh root@IP.

---

## 1. Обновление и базовые пакеты

```bash
apt update && apt upgrade -y
apt install -y curl git ufw build-essential
```

## 2. Firewall (ufw)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

Порты `3001` и `5432` снаружи **не открываем** — Node и Postgres слушают только loopback.

## 3. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v
```

## 4. PM2 (глобально)

```bash
npm install -g pm2
```

## 5. PostgreSQL 16

```bash
apt install -y postgresql postgresql-contrib
systemctl enable --now postgresql
```

Создаём БД и пользователя:

```bash
sudo -u postgres psql <<'EOF'
CREATE USER photoorder WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE photoorder OWNER photoorder;
GRANT ALL PRIVILEGES ON DATABASE photoorder TO photoorder;
EOF
```

`pg_hba.conf` на Ubuntu по умолчанию принимает `localhost` через md5/scram — менять не нужно. Postgres слушает только `127.0.0.1`, проверка:

```bash
ss -ltnp | grep 5432
```

## 6. nginx + certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx
```

---

## 7. Клонирование проекта

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Vladosh88/ProjectOrder.git photoorder
cd photoorder
mkdir -p logs
```

## 8. Переменные окружения

```bash
cp server/.env.example server/.env
nano server/.env
```

Заполнить:

- `NODE_ENV=production`
- `HOST=127.0.0.1` (важно — иначе порт 3001 будет торчать наружу)
- `PORT=3001`
- `DATABASE_URL="postgresql://photoorder:STRONG_PASSWORD_HERE@localhost:5432/photoorder"`
- `AUTH_LOGIN`, `AUTH_PASSWORD` — креды для входа в приложение
- `JWT_SECRET` — длинная случайная строка (`openssl rand -hex 32`)
- `CORS_ORIGIN="https://your-domain.tld"`
- `CLOUDINARY_*` — из dashboard cloudinary.com

## 9. Установка зависимостей и сборка

```bash
npm ci
( cd server && npx prisma generate && npx prisma migrate deploy )
( cd client && npm run build )
```

Если миграций ещё нет в репозитории, первый раз использовать `npx prisma db push` вместо `migrate deploy`.

## 10. Запуск через PM2

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

PM2 автоматически настроит systemd-сервис для автостарта при перезагрузке (от root это работает сразу, без дополнительных команд).

Проверка:

```bash
pm2 status
curl -i http://127.0.0.1:3001/api/health
```

## 11. Конфиг nginx

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/photoorder
sed -i 's/YOUR_DOMAIN/your-domain.tld/g' /etc/nginx/sites-available/photoorder
ln -sf /etc/nginx/sites-available/photoorder /etc/nginx/sites-enabled/photoorder
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## 12. TLS-сертификат

```bash
certbot --nginx -d your-domain.tld
```

Certbot сам перепишет конфиг на 443 и настроит редирект с 80. Проверка автообновления:

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

## 13. Финальная проверка

```bash
curl -I https://your-domain.tld
curl -i https://your-domain.tld/api/health
```

Должно быть `HTTP/2 200` и JSON `{"status":"ok",...}`.

---

## Обновление (раз настроено)

```bash
cd /var/www/photoorder
bash deploy/deploy.sh
```

Скрипт делает: `git pull` → `npm ci` → `prisma migrate deploy` → `vite build` → `pm2 reload`.

---

## Полезные команды

```bash
pm2 logs photoorder              # логи приложения
pm2 monit                        # мониторинг CPU/RAM
tail -f /var/log/nginx/photoorder.error.log
journalctl -u nginx -f
sudo -u postgres psql photoorder # консоль БД
```

## Бэкап БД

Минимальный — cron каждые сутки в 3:00:

```bash
crontab -e -u postgres
```

Добавить:

```
0 3 * * * pg_dump photoorder | gzip > /var/backups/photoorder-$(date +\%F).sql.gz && find /var/backups -name 'photoorder-*.sql.gz' -mtime +14 -delete
```

```bash
mkdir -p /var/backups && chown postgres:postgres /var/backups
```

## Траблшутинг

- **502 Bad Gateway** — Node не запущен или слушает не на `127.0.0.1:3001`. `pm2 status`, `curl http://127.0.0.1:3001/api/health`.
- **CORS errors** — `CORS_ORIGIN` в `.env` не совпадает с реальным URL. Должно быть со схемой и без слеша: `https://your-domain.tld`.
- **Prisma: can't reach database** — пароль в `DATABASE_URL` или Postgres не запущен. `sudo systemctl status postgresql`.
- **413 Request Entity Too Large** — увеличить `client_max_body_size` в `nginx.conf`.
- **PM2 не стартует после ребута** — повторно выполнить `pm2 startup` и `pm2 save`.

