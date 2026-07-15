@echo off
cd /d "%~dp0"
set "ROOT=%~dp0"

rem Start docker compose services in the background
docker compose up -d

set "START_DIR=%ROOT:~0,-1%"

where wt >nul 2>nul
if errorlevel 1 (
  rem Fallback when Windows Terminal is unavailable
  start "Online Auction - Backend" cmd /k "call ""%ROOT%scripts\run-backend-dev.bat"""
  start "Online Auction - Frontend" cmd /k "call ""%ROOT%scripts\run-frontend-dev.bat"""
) else (
  rem One Windows Terminal tab, split into Backend and Frontend panes
  wt -w 0 new-tab --title "Online Auction - App" --startingDirectory "%START_DIR%" cmd /k scripts\run-backend-dev.bat ; split-pane -H --title "Online Auction - Frontend" --startingDirectory "%START_DIR%" cmd /k scripts\run-frontend-dev.bat
)

echo All services have been launched!
pause
