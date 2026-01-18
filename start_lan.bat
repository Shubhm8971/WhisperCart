@echo off
echo Starting WhisperCart in LAN Mode...
cd WhisperCart
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.31.180
npx expo start --lan
pause
