@echo off
rem Start docker compose services in the background
docker compose up -d

rem Start Backend server in a new command window
start cmd /k "cd Backend && npm install && npm run dev"

rem Start Frontend server in a new command window
start cmd /k "cd Frontend && npm install && npm run dev"

echo All services have been launched!
pause
