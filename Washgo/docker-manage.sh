#!/bin/bash

# WashGo Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Function to check if ports are available
check_ports() {
    local ports=("3000" "8080" "5432" "5050")
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
            print_warning "Port $port is already in use"
        fi
    done
}

# Function to build services
build_services() {
    print_status "Building Docker services..."
    docker-compose build --no-cache
    print_success "Services built successfully"
}

# Function to start all services
start_all() {
    print_status "Starting all WashGo services..."
    docker-compose up -d
    print_success "All services started"
    
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_success "WashGo is now running!"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8080"
    echo "Database: localhost:5432"
    echo "pgAdmin: http://localhost:5050 (use --profile tools to enable)"
}

# Function to start with pgAdmin
start_with_tools() {
    print_status "Starting WashGo with development tools..."
    docker-compose --profile tools up -d
    print_success "All services including pgAdmin started"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all WashGo services..."
    docker-compose down
    print_success "All services stopped"
}

# Function to clean up everything
cleanup() {
    print_status "Cleaning up WashGo containers, networks, and volumes..."
    docker-compose down -v --remove-orphans
    
    print_status "Removing unused Docker resources..."
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Function to view logs
view_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Function to restart a specific service
restart_service() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service to restart"
        echo "Available services: frontend, backend, db, pgadmin"
        exit 1
    fi
    
    print_status "Restarting $service..."
    docker-compose restart "$service"
    print_success "$service restarted"
}

# Function to show status
show_status() {
    print_status "WashGo Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Function to backup database
backup_db() {
    local backup_file="washgo_backup_$(date +%Y%m%d_%H%M%S).sql"
    print_status "Creating database backup..."
    docker-compose exec -T db pg_dump -U postgres washgo > "$backup_file"
    print_success "Database backup created: $backup_file"
}

# Function to restore database
restore_db() {
    local backup_file=$1
    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        print_error "Please provide a valid backup file"
        exit 1
    fi
    
    print_status "Restoring database from $backup_file..."
    docker-compose exec -T db psql -U postgres -d washgo < "$backup_file"
    print_success "Database restored successfully"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose exec backend java -jar app.jar --spring.jpa.hibernate.ddl-auto=update
    print_success "Migrations completed"
}

# Function to show help
show_help() {
    echo "WashGo Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build              Build all Docker services"
    echo "  start              Start all services"
    echo "  start-tools        Start all services including pgAdmin"
    echo "  stop               Stop all services"
    echo "  restart [service]  Restart a specific service"
    echo "  status             Show service status and resource usage"
    echo "  logs [service]     Show logs (all services if no service specified)"
    echo "  cleanup            Stop services and remove containers, networks, volumes"
    echo "  backup-db          Create database backup"
    echo "  restore-db [file]  Restore database from backup"
    echo "  migrations         Run database migrations"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs backend             # Show backend logs"
    echo "  $0 restart frontend         # Restart frontend service"
    echo "  $0 backup-db                # Create database backup"
    echo "  $0 restore-db backup.sql    # Restore from backup"
}

# Main script logic
main() {
    case "${1:-help}" in
        "build")
            check_docker
            build_services
            ;;
        "start")
            check_docker
            check_ports
            start_all
            ;;
        "start-tools")
            check_docker
            check_ports
            start_with_tools
            ;;
        "stop")
            check_docker
            stop_all
            ;;
        "restart")
            check_docker
            restart_service "$2"
            ;;
        "status")
            check_docker
            show_status
            ;;
        "logs")
            check_docker
            view_logs "$2"
            ;;
        "cleanup")
            check_docker
            cleanup
            ;;
        "backup-db")
            check_docker
            backup_db
            ;;
        "restore-db")
            check_docker
            restore_db "$2"
            ;;
        "migrations")
            check_docker
            run_migrations
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"