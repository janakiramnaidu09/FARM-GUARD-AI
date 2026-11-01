@echo off
echo ========================================================
echo   🌾 Starting FarmGuard AI - Frontend (React + Vite)
echo   URL: http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"
call npm.cmd run dev
pause

