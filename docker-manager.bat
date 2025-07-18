@echo off
echo ================================================
echo     WELLVERSE FRONTEND - DOCKER MANAGER
echo ================================================
echo.

:menu
echo Select an action:
echo 1. Start Docker containers
echo 2. Stop Docker containers
echo 3. View logs
echo 4. Rebuild containers
echo 5. Check container status
echo 6. Clean up Docker resources
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo.
    call docker-start.bat
    echo.
    goto menu
) else if "%choice%"=="2" (
    echo.
    call docker-stop.bat
    echo.
    goto menu
) else if "%choice%"=="3" (
    echo.
    call docker-logs.bat
    echo.
    goto menu
) else if "%choice%"=="4" (
    echo.
    echo Rebuilding containers...
    echo Select environment to rebuild:
    echo 1. Development
    echo 2. Production
    echo 3. Development with backend
    echo.
    set /p rebuild_choice="Enter your choice (1-3): "
    
    if "!rebuild_choice!"=="1" (
        echo Command: docker-compose -f docker-compose.dev.yml up --build --force-recreate
        docker-compose -f docker-compose.dev.yml up --build --force-recreate
    ) else if "!rebuild_choice!"=="2" (
        echo Command: docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
        docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
    ) else if "!rebuild_choice!"=="3" (
        echo Command: docker-compose up --build --force-recreate
        docker-compose up --build --force-recreate
    ) else (
        echo Invalid choice.
    )
    echo.
    goto menu
) else if "%choice%"=="5" (
    echo.
    echo Checking container status...
    echo Command: docker ps -a
    docker ps -a
    echo.
    echo Command: docker-compose -f docker-compose.dev.yml ps
    docker-compose -f docker-compose.dev.yml ps
    echo.
    goto menu
) else if "%choice%"=="6" (
    echo.
    echo Cleaning up Docker resources...
    echo Command: docker system prune -f
    docker system prune -f
    echo Command: docker volume prune -f
    docker volume prune -f
    echo Command: docker image prune -f
    docker image prune -f
    echo Cleanup completed.
    echo.
    goto menu
) else if "%choice%"=="7" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    echo.
    goto menu
)

echo.
echo ================================================
echo Press any key to continue...
pause >nul
