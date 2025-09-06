@echo off
echo Portfolio App Environment Manager
echo ==============================
echo.

:menu
echo Choose an environment to run:
echo 1. Development (localhost)
echo 2. Production (Netlify/Render)
echo 3. Exit
echo.

set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
if "%choice%"=="3" goto end

echo Invalid choice. Please try again.
goto menu

:dev
echo.
echo Starting in DEVELOPMENT mode...
echo.
set NODE_ENV=development
npm run dev
goto end

:prod
echo.
echo Starting with PRODUCTION settings...
echo.
set NODE_ENV=production
npm run dev
goto end

:end
echo.
echo Exiting...
exit /b 0
