@echo off
echo ==========================================
echo   WhisperCart Public Access Launcher
echo ==========================================
echo.
echo 1. Starting Backend & Public Tunnel...
echo    (This will auto-update api.ts with the new URL)
start "WhisperCart Backend" cmd /k "cd backend && node server.js"

echo.
echo 2. Waiting for tunnel to establish (10 seconds)...
timeout /t 10 >nul

echo.
echo 3. Starting Mobile App (Tunnel Mode)...
cd WhisperCart
npx expo start --clear --tunnel
pause
