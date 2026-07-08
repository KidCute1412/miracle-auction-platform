@echo off
setlocal

cd /d "%~dp0"

if not exist "AgentService\.env" (
  copy "AgentService\.env.example" "AgentService\.env" >nul
)

docker compose up -d postgres
if errorlevel 1 (
  echo Failed to start Postgres with Docker Compose.
  exit /b 1
)

cd AgentService

if not exist "node_modules" (
  call npm install
  if errorlevel 1 exit /b 1
)

call npm run migrate
if errorlevel 1 (
  echo Failed to apply AgentService migration.
  exit /b 1
)

start "AgentService API" cmd /k "cd /d %cd% && npm run dev"
start "Agent Worker" cmd /k "cd /d %cd% && npm run worker"

echo AgentService API and worker are starting.
echo API: http://localhost:8010
echo Health: http://localhost:8010/health

endlocal
