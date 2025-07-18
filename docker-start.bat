@echo off
echo ================================================
echo     WELLVERSE FRONTEND - DOCKER START
echo ================================================
echo.

echo Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

echo Docker is available.
echo.

echo Select environment:
echo 1. Development (Hot reload, port 5173)
echo 2. Production (Nginx, port 80)
echo 3. Development with backend connection
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting Development environment...
    echo Command: docker-compose -f docker-compose.dev.yml up --build
    docker-compose -f docker-compose.dev.yml up --build
) else if "%choice%"=="2" (
    echo Starting Production environment...
    echo Command: docker-compose -f docker-compose.prod.yml up --build -d
    docker-compose -f docker-compose.prod.yml up --build -d
    echo.
    echo Production server started in background.
    echo Access at: http://localhost
) else if "%choice%"=="3" (
    echo Starting Development with backend connection...
    echo Command: docker-compose up --build
    docker-compose up --build
) else (
    echo Invalid choice. Starting Development environment by default...
    echo Command: docker-compose -f docker-compose.dev.yml up --build
    docker-compose -f docker-compose.dev.yml up --build
)

echo.
echo ================================================
echo Press any key to exit...
pause >nul
