@echo off
echo ========================================================
echo   🌾 Starting FarmGuard AI - Full Stack
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo ========================================================

start "FarmGuard Backend API (Port 3000)" cmd /k "cd /d "%~dp0backend" && npm.cmd run dev"
timeout /t 3 /nobreak >nul
start "FarmGuard Frontend Web (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

