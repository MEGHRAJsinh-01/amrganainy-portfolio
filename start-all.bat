@echo off
echo Starting Portfolio Application...
echo.
echo Starting server and client concurrently in PowerShell tabs...
powershell.exe -Command "Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', 'cd server; npm start' -WindowStyle Normal"
powershell.exe -Command "Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', 'cd client; npm run dev' -WindowStyle Normal"
echo.
echo Services started in separate PowerShell tabs!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5174
echo.
