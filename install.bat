@echo off
echo Installing Wellness Session Manager...
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Building backend...
cd ..\backend
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build backend
    pause
    exit /b 1
)

echo.
echo Installation completed successfully!
echo.
echo To start the application:
echo 1. Make sure MongoDB is running
echo 2. Run 'start-app.bat' to start both frontend and backend
echo.
pause
