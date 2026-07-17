@echo off
setlocal
cd /d "%~dp0"
set "ROOT=%~dp0"
set "START_DIR=%ROOT:~0,-1%"

rem start.bat is the only local entrypoint: infrastructure -> Prisma -> optional demo seed -> app.
docker compose up -d postgres redis kafka
if errorlevel 1 exit /b 1

:wait_for_postgres
docker compose exec -T postgres pg_isready -U postgres -d online_auction_test >nul 2>nul
if errorlevel 1 (
  timeout /t 2 >nul
  goto wait_for_postgres
)

pushd Backend
call npm.cmd install
if errorlevel 1 goto backend_failed
call npx.cmd prisma generate
if errorlevel 1 goto backend_failed
call npx.cmd prisma migrate deploy
if errorlevel 1 goto backend_failed
popd

set "SEED_STATE="
for /f "usebackq delims=" %%A in (`docker compose exec -T postgres psql -U postgres -d online_auction_test -tAc "SELECT CASE WHEN EXISTS (SELECT 1 FROM categories) THEN 'seeded' ELSE 'empty' END"`) do set "SEED_STATE=%%A"
if /i "%SEED_STATE%"=="empty" (
  echo Seeding local demo data...
  rem Copy UTF-8 seed files into the Linux container before importing. CMD input
  rem redirection (< file.sql) uses the active Windows code page and corrupts
  rem Vietnamese characters before psql receives them.
  docker compose cp "%ROOT%data\category\category.insert.sql" postgres:/tmp/category.insert.sql
  if errorlevel 1 exit /b 1
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d online_auction_test -f /tmp/category.insert.sql
  if errorlevel 1 exit /b 1
  docker compose cp "%ROOT%data\user\user.insert.sql" postgres:/tmp/user.insert.sql
  if errorlevel 1 exit /b 1
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d online_auction_test -f /tmp/user.insert.sql
  if errorlevel 1 exit /b 1
  docker compose cp "%ROOT%data\product\tikiAPI\product.insert.sql" postgres:/tmp/product.insert.sql
  if errorlevel 1 exit /b 1
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d online_auction_test -f /tmp/product.insert.sql
  if errorlevel 1 exit /b 1
)

docker compose up -d node-worker
if errorlevel 1 exit /b 1

where wt >nul 2>nul
if errorlevel 1 (
  start "Online Auction - Backend" cmd /k "call \"%ROOT%scripts\run-backend-dev.bat\""
  start "Online Auction - Frontend" cmd /k "call \"%ROOT%scripts\run-frontend-dev.bat\""
) else (
  wt -w 0 new-tab --title "Online Auction - App" --startingDirectory "%START_DIR%" cmd /k scripts\run-backend-dev.bat ; split-pane -H --title "Online Auction - Frontend" --startingDirectory "%START_DIR%" cmd /k scripts\run-frontend-dev.bat
)

echo All services have been launched.
exit /b 0

:backend_failed
popd
exit /b 1
