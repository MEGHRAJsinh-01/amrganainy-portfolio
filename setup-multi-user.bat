@echo off
echo ====================================================
echo    Multi-User Portfolio Platform Setup Script
echo ====================================================
echo.

echo Checking if required modules are installed...
cd client
call npm list react-router-dom >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Installing react-router-dom...
    call npm install react-router-dom @types/react-router-dom
) else (
    echo react-router-dom is already installed.
)

echo.
echo Installing additional recommended dependencies...
call npm install jwt-decode axios react-hook-form

echo.
echo Setting up backend for multi-user support...
cd ..
cd server
echo Creating directories for user uploads...
mkdir -p uploads/profiles
mkdir -p uploads/projects
mkdir -p uploads/cvs

echo.
echo Creating MongoDB indexes for multi-user support...
echo Note: You'll need to run these commands in MongoDB:
echo.
echo db.createCollection("users");
echo db.createCollection("profiles");
echo db.createCollection("projects");
echo db.users.createIndex({ "email": 1 }, { unique: true });
echo db.users.createIndex({ "username": 1 }, { unique: true });
echo db.profiles.createIndex({ "userId": 1 }, { unique: true });
echo db.projects.createIndex({ "userId": 1 });
echo.

echo.
echo Setup complete! Next steps:
echo 1. Uncomment the MultiUserApp import in App.tsx
echo 2. Replace the placeholder UI with the actual MultiUserApp component
echo 3. Review the implementation documentation in:
echo    - MULTI_USER_README.md
echo    - client/MULTI_USER_IMPLEMENTATION.md
echo    - server/MULTI_USER_BACKEND_PLAN.md
echo.
echo You can toggle between single-user and multi-user modes using Ctrl+Shift+M
echo.

pause
