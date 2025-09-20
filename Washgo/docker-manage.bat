@echo off
setlocal enabledelayedexpansion

REM WashGo Docker Management Script for Windows

set "command=%1"

if "%command%"=="" set "command=help"

goto :%command% 2>nul || goto :help

:build
echo [INFO] Building Docker services...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build services
    exit /b 1
)
echo [SUCCESS] Services built successfully
goto :eof

:start
echo [INFO] Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo [INFO] Starting all WashGo services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)

echo [INFO] Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

echo [INFO] Service Status:
docker-compose ps

echo.
echo [SUCCESS] WashGo is now running!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8080
echo Database: localhost:5432
echo pgAdmin: http://localhost:5050 (use start-tools to enable)
goto :eof

:start-tools
echo [INFO] Starting WashGo with development tools...
docker-compose --profile tools up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [SUCCESS] All services including pgAdmin started
goto :eof

:start-dev
echo [INFO] Starting WashGo in development mode...
docker-compose -f docker-compose.dev.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start development services
    exit /b 1
)

echo [INFO] Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

echo [INFO] Development Service Status:
docker-compose -f docker-compose.dev.yml ps

echo.
echo [SUCCESS] WashGo development environment is now running!
echo Frontend (Vite): http://localhost:5173
echo Backend API: http://localhost:8080
echo Database: localhost:5432
echo pgAdmin: http://localhost:5050
goto :eof

:stop-dev
echo [INFO] Stopping WashGo development services...
docker-compose -f docker-compose.dev.yml down
if %errorlevel% neq 0 (
    echo [ERROR] Failed to stop development services
    exit /b 1
)
echo [SUCCESS] Development services stopped
goto :eof

:stop
echo [INFO] Stopping all WashGo services...
docker-compose down
if %errorlevel% neq 0 (
    echo [ERROR] Failed to stop services
    exit /b 1
)
echo [SUCCESS] All services stopped
goto :eof

:restart
set "service=%2"
if "%service%"=="" (
    echo [ERROR] Please specify a service to restart
    echo Available services: frontend, backend, db, pgadmin
    exit /b 1
)

echo [INFO] Restarting %service%...
docker-compose restart %service%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to restart %service%
    exit /b 1
)
echo [SUCCESS] %service% restarted
goto :eof

:status
echo [INFO] WashGo Service Status:
docker-compose ps

echo.
echo [INFO] Resource Usage:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
goto :eof

:logs
set "service=%2"
if "%service%"=="" (
    echo [INFO] Showing logs for all services...
    docker-compose logs -f
) else (
    echo [INFO] Showing logs for %service%...
    docker-compose logs -f %service%
)
goto :eof

:cleanup
echo [INFO] Cleaning up WashGo containers, networks, and volumes...
docker-compose down -v --remove-orphans

echo [INFO] Removing unused Docker resources...
docker system prune -f

echo [SUCCESS] Cleanup completed
goto :eof

:backup-db
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set "today=%%c%%a%%b"
for /f "tokens=1-3 delims=: " %%a in ('time /t') do set "now=%%a%%b%%c"
set "backup_file=washgo_backup_%today%_%now%.sql"

echo [INFO] Creating database backup...
docker-compose exec -T db pg_dump -U postgres washgo > %backup_file%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create backup
    exit /b 1
)
echo [SUCCESS] Database backup created: %backup_file%
goto :eof

:restore-db
set "backup_file=%2"
if "%backup_file%"=="" (
    echo [ERROR] Please provide a backup file
    exit /b 1
)
if not exist "%backup_file%" (
    echo [ERROR] Backup file does not exist: %backup_file%
    exit /b 1
)

echo [INFO] Restoring database from %backup_file%...
docker-compose exec -T db psql -U postgres -d washgo < %backup_file%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to restore database
    exit /b 1
)
echo [SUCCESS] Database restored successfully
goto :eof

:help
echo WashGo Docker Management Script for Windows
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   build              Build all Docker services
echo   start              Start all services
echo   start-dev          Start all services in development mode
echo   start-tools        Start all services including pgAdmin
echo   stop               Stop all services
echo   stop-dev           Stop development services
echo   restart [service]  Restart a specific service
echo   status             Show service status and resource usage
echo   logs [service]     Show logs (all services if no service specified)
echo   cleanup            Stop services and remove containers, networks, volumes
echo   backup-db          Create database backup
echo   restore-db [file]  Restore database from backup
echo   help               Show this help message
echo.
echo Examples:
echo   %0 start                    # Start all services
echo   %0 logs backend             # Show backend logs
echo   %0 restart frontend         # Restart frontend service
echo   %0 backup-db                # Create database backup
echo   %0 restore-db backup.sql    # Restore from backup
goto :eof