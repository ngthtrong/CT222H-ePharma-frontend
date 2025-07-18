@echo off
echo ================================================
echo     WELLVERSE FRONTEND - DOCKER STOP
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

echo Select what to stop:
echo 1. Development environment
echo 2. Production environment
echo 3. Development with backend
echo 4. Stop all containers
echo 5. Stop all and clean up (remove volumes)
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Stopping Development environment...
    echo Command: docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml down
) else if "%choice%"=="2" (
    echo Stopping Production environment...
    echo Command: docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml down
) else if "%choice%"=="3" (
    echo Stopping Development with backend...
    echo Command: docker-compose down
    docker-compose down
) else if "%choice%"=="4" (
    echo Stopping all containers...
    echo Command: docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml down
    echo Command: docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml down
    echo Command: docker-compose down
    docker-compose down
) else if "%choice%"=="5" (
    echo Stopping all containers and removing volumes...
    echo Command: docker-compose -f docker-compose.dev.yml down -v
    docker-compose -f docker-compose.dev.yml down -v
    echo Command: docker-compose -f docker-compose.prod.yml down -v
    docker-compose -f docker-compose.prod.yml down -v
    echo Command: docker-compose down -v
    docker-compose down -v
    echo.
    echo Cleaning up unused Docker resources...
    echo Command: docker system prune -f
    docker system prune -f
    echo Command: docker volume prune -f
    docker volume prune -f
) else (
    echo Invalid choice. Stopping Development environment by default...
    echo Command: docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml down
)

echo.
echo ================================================
echo Docker containers stopped successfully!
echo Press any key to exit...
pause >nul
