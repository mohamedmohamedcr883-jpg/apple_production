@echo off
title Apple Store Launcher
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed. Get it from https://nodejs.org
    pause
    exit /b 1
)

if not exist "BE\.env" (
    echo BE\.env is missing. Copy .env.example to BE\.env and fill in your values.
    pause
    exit /b 1
)

if not exist "BE\node_modules" (
    echo Installing backend dependencies...
    call npm install --prefix BE || (pause & exit /b 1)
)

if not exist "FE\node_modules" (
    echo Installing frontend dependencies...
    call npm install --prefix FE || (pause & exit /b 1)
)

echo Building backend...
call npm run build --prefix BE || (pause & exit /b 1)

start "Apple Store - Backend (3000)" cmd /k "cd /d "%~dp0BE" && node dist/index.js"
start "Apple Store - Frontend (5173)" cmd /k "cd /d "%~dp0FE" && npx vite --port 5173 --strictPort"

echo Waiting for servers to start...
timeout /t 6 /nobreak >nul
start "" http://localhost:5173

echo.
echo Store:  http://localhost:5173
echo Admin:  http://localhost:5173/pages/admin-login.html
echo API:    http://localhost:3000/health
echo.
echo Close the Backend and Frontend windows to stop the servers.
pause
