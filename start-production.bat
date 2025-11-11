@echo off
echo Starting AEMCO Contract Builder in Production Mode...
echo.

set NODE_ENV=production

echo Checking if application is already running...
pm2 describe aemco-contract-builder >nul 2>&1
if %errorlevel% equ 0 (
    echo Application is already running. Restarting...
    pm2 restart aemco-contract-builder
) else (
    echo Starting application with PM2...
    pm2 start ecosystem.config.js
)

echo.
echo Application Status:
pm2 status

echo.
echo To view logs: pm2 logs
echo To stop: pm2 stop aemco-contract-builder
echo.
pause
