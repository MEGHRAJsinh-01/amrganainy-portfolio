@echo off
echo Starting Portfolio Application...
echo.
echo Starting server and client concurrently...
start cmd /k "cd server && npm start"
start cmd /k "cd client && npm run dev"
echo.
echo Services started!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5174
echo.
