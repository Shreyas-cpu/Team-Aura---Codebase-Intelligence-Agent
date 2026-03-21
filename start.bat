@echo off
title CodeAura Startup Subsystem
color 0A

echo.
echo ==============================================================
echo        ⬡ CodeAura Intelligence Boot Sequence Initiated ⬡
echo ==============================================================
echo.

echo [1/3] Refreshing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo [2/3] Refreshing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Launching System Services...

:: Start the backend in a new command window so we can see its logs
start "CodeAura Backend Server (Port 3001)" cmd /k "color 0B && title CodeAura Backend Server (Port 3001) && cd backend && node index.js"

:: Give backend a second to boot before starting frontend (optional but good practice)
timeout /t 2 /nobreak >nul

:: Start the frontend in a new command window
start "CodeAura Frontend UI (Port 5173)" cmd /k "color 0D && title CodeAura Frontend UI (Port 5173) && cd frontend && npm run dev"

echo.
echo ==============================================================
echo                 SYSTEM ONLINE - ALL GO
echo ==============================================================
echo.
echo   ⬡ Backend Services:  http://localhost:3001
echo   ⬡ Frontend Dashboard: http://localhost:5173
echo.
echo Two new terminal windows have been opened to run your servers.
echo You can now minimize this window.
echo.
pause
