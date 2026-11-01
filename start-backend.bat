@echo off
echo ========================================================
echo   🌾 Starting FarmGuard AI - Backend (Express API)
echo   URL: http://localhost:3000
echo ========================================================
cd /d "%~dp0backend"
call npm.cmd run dev
pause

