@echo off
echo Starting WhisperCart Flask Servers...
echo.

echo Starting Flask Backend...
start "Flask Backend" cmd /k "cd /d "C:\Users\Shubh Mittal\OneDrive\Desktop\WhisperCart\flask_backend" && python app.py"

timeout /t 3 /nobreak >nul

echo Starting Web Server...
start "Web Server" cmd /k "cd /d "C:\Users\Shubh Mittal\OneDrive\Desktop\WhisperCart" && python serve.py"

echo.
echo Servers are starting...
echo.
echo Flask Backend: http://192.168.31.180:5000
echo Mobile App: http://192.168.31.180:8080/mobile.html
echo.
echo Press any key to exit...
pause >nul