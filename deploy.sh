#!/bin/bash

# Production Deployment Script for AMHSJ
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="amhsj"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting deployment for AMHSJ - Environment: $ENVIRONMENT"

# Function to print colored output
print_status() {
    echo -e "\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"
}

print_error() {
    echo -e "\033[1;31m$1\033[0m"
}

# Check if required files exist
check_requirements() {
    print_status "📋 Checking deployment requirements..."
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        print_error "❌ docker-compose.prod.yml not found!"
        exit 1
    fi
    
    if [ ! -f ".env.production" ]; then
        print_error "❌ .env.production not found!"
        exit 1
    fi
    
    if [ ! -f "Dockerfile" ]; then
        print_error "❌ Dockerfile not found!"
        exit 1
    fi
    
    print_success "✅ All required files present"
}

# Backup current deployment
backup_current() {
    print_status "💾 Creating backup of current deployment..."
    
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        # Create database backup
        mkdir -p ./backups
        BACKUP_FILE="./backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        docker-compose -f $DOCKER_COMPOSE_FILE exec postgres pg_dump -U $POSTGRES_USER amhsj > $BACKUP_FILE
        print_success "✅ Database backup created: $BACKUP_FILE"
    else
        print_status "ℹ️  No running containers to backup"
    fi
}

# Pull latest images and build
build_application() {
    print_status "🔨 Building application..."
    
    # Pull latest base images
    docker-compose -f $DOCKER_COMPOSE_FILE pull
    
    # Build the application
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    print_success "✅ Application built successfully"
}

# Deploy the application
deploy() {
    print_status "🚢 Deploying application..."
    
    # Stop existing containers
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Start new containers
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    print_success "✅ Application deployed successfully"
}

# Health check
health_check() {
    print_status "🏥 Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check if containers are running
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        print_success "✅ Containers are running"
    else
        print_error "❌ Some containers failed to start"
        docker-compose -f $DOCKER_COMPOSE_FILE logs
        exit 1
    fi
    
    # Check application health endpoint
    for i in {1..10}; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            print_success "✅ Application health check passed"
            break
        else
            if [ $i -eq 10 ]; then
                print_error "❌ Application health check failed after 10 attempts"
                exit 1
            fi
            print_status "⏳ Waiting for application to start... (attempt $i/10)"
            sleep 10
        fi
    done
}

# Database migration
run_migrations() {
    print_status "🗃️  Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations (adjust based on your migration setup)
    docker-compose -f $DOCKER_COMPOSE_FILE exec app npm run db:migrate
    
    print_success "✅ Database migrations completed"
}

# Clean up old images
cleanup() {
    print_status "🧹 Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old project images (keep last 2 versions)
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        grep $PROJECT_NAME | \
        tail -n +3 | \
        awk '{print $1}' | \
        xargs -r docker rmi
    
    print_success "✅ Cleanup completed"
}

# Enable maintenance mode
enable_maintenance() {
    print_status "🔧 Enabling maintenance mode..."
    
    # Create maintenance flag file
    docker-compose -f $DOCKER_COMPOSE_FILE exec nginx touch /tmp/maintenance_mode
    
    print_success "✅ Maintenance mode enabled"
}

# Disable maintenance mode
disable_maintenance() {
    print_status "✅ Disabling maintenance mode..."
    
    # Remove maintenance flag file
    docker-compose -f $DOCKER_COMPOSE_FILE exec nginx rm -f /tmp/maintenance_mode
    
    print_success "✅ Maintenance mode disabled"
}

# Main deployment flow
main() {
    print_status "🎯 Starting AMHSJ deployment process..."
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    case "${2:-deploy}" in
        "maintenance-on")
            enable_maintenance
            ;;
        "maintenance-off")
            disable_maintenance
            ;;
        "backup")
            backup_current
            ;;
        "deploy")
            check_requirements
            backup_current
            enable_maintenance
            build_application
            deploy
            run_migrations
            health_check
            disable_maintenance
            cleanup
            print_success "🎉 Deployment completed successfully!"
            print_status "📊 Application is now running at: https://yourdomain.com"
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo "Actions: deploy, backup, maintenance-on, maintenance-off"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
