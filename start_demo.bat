@echo off
echo ==========================================
echo   WhisperCart OFFLINE DEMO MODE
echo ==========================================
echo.
echo Cleaning cache to ensure new code loads...
cd WhisperCart
rmdir /s /q .expo
rmdir /s /q node_modules\.cache

echo.
echo Starting App in Web Browser...
echo (You do NOT need the backend server running)
npx expo start --clear --web
pause
