@echo off
echo ========================================
echo AEMCO Contract Builder - Setup Script
echo ========================================
echo.

echo Step 1: Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 24.11.0 from https://nodejs.org
    pause
    exit /b 1
)
echo.

echo Step 2: Installing dependencies...
echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)
echo.

echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)
cd ..
echo.

echo Step 3: Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend!
    pause
    exit /b 1
)
cd ..
echo.

echo Step 4: Environment setup...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and configure your database credentials!
    echo Press any key to open .env file in notepad...
    pause
    notepad .env
) else (
    echo .env file already exists, skipping...
)
echo.

echo Step 5: Database setup...
echo.
echo IMPORTANT: Before proceeding, ensure:
echo 1. MariaDB is running
echo 2. Database credentials are configured in .env
echo 3. Database user has necessary privileges
echo.
set /p continue="Do you want to setup the database now? (y/n): "
if /i "%continue%"=="y" (
    node server\setup-database.js
    if %errorlevel% neq 0 (
        echo ERROR: Database setup failed!
        echo Please check your database credentials in .env
        pause
        exit /b 1
    )
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Default Admin Credentials:
echo Email: admin@ahmed-essa.com
echo Password: Admin@123456
echo.
echo IMPORTANT: Change the admin password after first login!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To start the production server:
echo   npm start
echo.
pause
