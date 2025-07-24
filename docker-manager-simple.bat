@echo off
REM Docker management script for WellVerse Frontend

if "%1"=="" (
    echo Usage: docker-manager.bat [dev^|prod^|stop^|clean^|logs^|shell]
    echo.
    echo Commands:
    echo   dev    - Start in development mode
    echo   prod   - Start in production mode  
    echo   stop   - Stop all containers
    echo   clean  - Clean containers and volumes
    echo   logs   - Show container logs
    echo   shell  - Access container shell
    exit /b 1
)

if "%1"=="dev" (
    echo Starting in development mode...
    docker-compose --env-file .env.development up --build
    goto end
)

if "%1"=="prod" (
    echo Starting in production mode...
    docker-compose --env-file .env.production up --build -d
    goto end
)

if "%1"=="stop" (
    echo Stopping containers...
    docker-compose down
    goto end
)

if "%1"=="clean" (
    echo Cleaning containers and volumes...
    docker-compose down -v --remove-orphans
    docker system prune -f
    goto end
)

if "%1"=="logs" (
    echo Showing logs...
    docker-compose logs -f frontend
    goto end
)

if "%1"=="shell" (
    echo Accessing container shell...
    docker-compose exec frontend sh
    goto end
)

echo Unknown command: %1
echo Use 'docker-manager.bat' without arguments to see usage

:end
