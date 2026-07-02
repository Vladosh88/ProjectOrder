@echo off
REM =============================================
REM  Диагностика доступности nastyawb.online
REM  Запускать от имени обычного пользователя
REM =============================================

echo.
echo === 1. Проверка DNS ===
nslookup nastyawb.online
echo.

echo === 2. Проверка TCP к порту 443 (IPv4) ===
curl.exe -4 -s --connect-timeout 5 --max-time 10 -o nul -w "HTTP code: %%{http_code}\nTime: %%{time_total}s\n" https://nastyawb.online/api/health
echo.

echo === 3. Проверка TCP к порту 443 (IPv6) ===
curl.exe -6 -s --connect-timeout 5 --max-time 10 -o nul -w "HTTP code: %%{http_code}\nTime: %%{time_total}s\n" https://nastyawb.online/api/health 2>&1
echo.

echo === 4. Проверка через публичный DNS (1.1.1.1) ===
nslookup nastyawb.online 1.1.1.1
echo.

echo === 5. Очистка DNS-кеша ===
ipconfig /flushdns
echo.

echo === 6. Тест TCP-соединения ===
Test-NetConnection -ComputerName nastyawb.online -Port 443 -WarningAction SilentlyContinue | Select-Object ComputerName, RemotePort, TcpTestSucceeded
echo.

echo === 7. Попытка скачать страницу через curl ===
curl.exe -4 -s --connect-timeout 10 --max-time 15 -o nul -w "HTTP code: %%{http_code}, Size: %%{size_download} bytes\n" https://nastyawb.online/
echo.

echo =============================================
echo  Если IPv4 работает (HTTP 200), но браузер
echo  показывает ERR_CONNECTION_RESET — проблема
echo  в VPN. Отключи VPN и повтори проверку.
echo =============================================
pause
