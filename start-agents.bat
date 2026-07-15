@echo off
setlocal

cd /d "%~dp0"
set "ROOT=%~dp0"

if not exist "AgentService\.env" (
  copy "AgentService\.env.example" "AgentService\.env" >nul
)

docker compose stop agent-service agent-worker >nul 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "$envLine = Get-Content 'AgentService\.env' | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1; $url = [Uri]($envLine -replace '^DATABASE_URL=', ''); $hostName = if ($url.Host) { $url.Host } else { '127.0.0.1' }; $port = if ($url.Port -gt 0) { $url.Port } else { 5432 }; $client = [Net.Sockets.TcpClient]::new(); try { $client.Connect($hostName, $port); exit 0 } catch { exit 1 } finally { $client.Dispose() }"
if errorlevel 1 (
  docker compose up -d postgres
  if errorlevel 1 (
    echo Failed to start Postgres with Docker Compose.
    echo If another local Postgres is using the configured port, update AgentService\.env DATABASE_URL to point to it.
    exit /b 1
  )
) else (
  echo Postgres is already available for AgentService. Skipping Docker Postgres startup.
)

cd AgentService

if not exist "node_modules" (
  call npm install
  if errorlevel 1 exit /b 1
)

call npm run migrate
if errorlevel 1 (
  echo Failed to apply AgentService migration.
  echo.
  echo Most common cause: AgentService\.env DATABASE_URL points to a different Postgres than this project's Docker Postgres.
  echo Fix option 1: update AgentService\.env DATABASE_URL with the correct local Postgres user/password.
  echo Fix option 2: use this project's default port 15432 and rerun start.bat and start-agents.bat.
  exit /b 1
)

cd ..

set "START_DIR=%ROOT:~0,-1%"

set "USE_WT=1"
where wt >nul 2>nul
if errorlevel 1 set "USE_WT=0"
if "%USE_WT%"=="1" (
  wt --version >nul 2>nul
  if errorlevel 1 set "USE_WT=0"
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\start-agent-services-hidden.ps1"

if "%USE_WT%"=="0" (
  start "Antigravity" powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\watch-agent-channel.ps1" -Channel "Antigravity"
  start "Codex" powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\watch-agent-channel.ps1" -Channel "Codex"
) else (
  wt -w 0 new-tab --title "Antigravity" --startingDirectory "%START_DIR%" powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\watch-agent-channel.ps1" -Channel "Antigravity" ; split-pane -H --title "Codex" --startingDirectory "%START_DIR%" powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\watch-agent-channel.ps1" -Channel "Codex"
)

echo AgentService API and worker are starting in the background.
echo API: http://localhost:8010
echo Health: http://localhost:8010/health
echo Logs: AgentService\.logs\api.log and AgentService\.logs\worker.log
echo Submit a task: .\agent-task.bat

endlocal
