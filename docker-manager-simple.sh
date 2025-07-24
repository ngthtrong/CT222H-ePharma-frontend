#!/bin/bash

# Docker management script for WellVerse Frontend

if [ $# -eq 0 ]; then
    echo "Usage: ./docker-manager-simple.sh [dev|prod|stop|clean|logs|shell]"
    echo ""
    echo "Commands:"
    echo "  dev    - Start in development mode"
    echo "  prod   - Start in production mode"
    echo "  stop   - Stop all containers"
    echo "  clean  - Clean containers and volumes"
    echo "  logs   - Show container logs"
    echo "  shell  - Access container shell"
    exit 1
fi

case "$1" in
    "dev")
        echo "Starting in development mode..."
        docker-compose --env-file .env.development up --build
        ;;
    "prod")
        echo "Starting in production mode..."
        docker-compose --env-file .env.production up --build -d
        ;;
    "stop")
        echo "Stopping containers..."
        docker-compose down
        ;;
    "clean")
        echo "Cleaning containers and volumes..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        ;;
    "logs")
        echo "Showing logs..."
        docker-compose logs -f frontend
        ;;
    "shell")
        echo "Accessing container shell..."
        docker-compose exec frontend sh
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use './docker-manager-simple.sh' without arguments to see usage"
        exit 1
        ;;
esac
