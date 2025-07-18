@echo off
echo ================================================
echo     WELLVERSE FRONTEND - DOCKER LOGS
echo ================================================
echo.

echo Select logs to view:
echo 1. Development environment logs
echo 2. Production environment logs
echo 3. Development with backend logs
echo 4. Live logs (follow mode)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Showing Development environment logs...
    echo Command: docker-compose -f docker-compose.dev.yml logs
    docker-compose -f docker-compose.dev.yml logs
) else if "%choice%"=="2" (
    echo Showing Production environment logs...
    echo Command: docker-compose -f docker-compose.prod.yml logs
    docker-compose -f docker-compose.prod.yml logs
) else if "%choice%"=="3" (
    echo Showing Development with backend logs...
    echo Command: docker-compose logs
    docker-compose logs
) else if "%choice%"=="4" (
    echo Following Development environment logs (Press Ctrl+C to stop)...
    echo Command: docker-compose -f docker-compose.dev.yml logs -f
    docker-compose -f docker-compose.dev.yml logs -f
) else (
    echo Invalid choice. Showing Development environment logs by default...
    echo Command: docker-compose -f docker-compose.dev.yml logs
    docker-compose -f docker-compose.dev.yml logs
)

echo.
echo ================================================
echo Press any key to exit...
pause >nul
