#!/bin/bash

# Vercel Deployment Script for AMHSJ
# Usage: ./deploy-vercel.sh [environment] [action]

set -e

ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}

echo "🚀 Starting Vercel deployment for AMHSJ - Environment: $ENVIRONMENT"

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

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
        print_success "✅ Vercel CLI installed"
    else
        print_success "✅ Vercel CLI found"
    fi
}

# Check if user is logged in to Vercel
check_vercel_auth() {
    if ! vercel whoami &> /dev/null; then
        print_error "❌ Not logged in to Vercel"
        print_status "🔑 Please log in to Vercel:"
        vercel login
    else
        VERCEL_USER=$(vercel whoami)
        print_success "✅ Logged in as: $VERCEL_USER"
    fi
}

# Pull environment variables
pull_env_vars() {
    print_status "📥 Pulling environment variables..."
    
    # Pull environment variables for the specific environment
    vercel env pull .env.local --environment=$ENVIRONMENT
    
    if [ -f ".env.local" ]; then
        print_success "✅ Environment variables pulled successfully"
    else
        print_error "❌ Failed to pull environment variables"
        exit 1
    fi
}

# Build locally to check for errors
build_locally() {
    print_status "🔨 Building locally to check for errors..."
    
    # Install dependencies
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install
    elif [ -f "yarn.lock" ]; then
        yarn install
    else
        npm install
    fi
    
    # Build the project
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm build
    elif [ -f "yarn.lock" ]; then
        yarn build
    else
        npm run build
    fi
    
    print_success "✅ Local build successful"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "🚢 Deploying to Vercel..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Deploy to production
        vercel --prod --yes
    else
        # Deploy to preview
        vercel --yes
    fi
    
    print_success "✅ Deployment completed"
}

# Setup Vercel services (first time only)
setup_vercel_services() {
    print_status "🗄️ Setting up Vercel services..."
    
    # Check if services already exist
    if vercel storage ls | grep -q "amhsj"; then
        print_status "ℹ️ Vercel services already configured"
        return
    fi
    
    # Create Postgres database
    print_status "📊 Creating Postgres database..."
    vercel storage create postgres --name amhsj-db --yes || true
    
    # Create KV store for caching
    print_status "🔄 Creating KV store..."
    vercel storage create kv --name amhsj-cache --yes || true
    
    # Create Blob store for file uploads
    print_status "📁 Creating Blob storage..."
    vercel storage create blob --name amhsj-files --yes || true
    
    print_success "✅ Vercel services setup completed"
}

# Enable maintenance mode
enable_maintenance() {
    print_status "🔧 Enabling maintenance mode..."
    
    # Add maintenance mode environment variable
    echo "true" | vercel env add MAINTENANCE_MODE $ENVIRONMENT
    
    # Redeploy with maintenance mode
    deploy_to_vercel
    
    print_success "✅ Maintenance mode enabled"
}

# Disable maintenance mode
disable_maintenance() {
    print_status "✅ Disabling maintenance mode..."
    
    # Remove maintenance mode environment variable
    vercel env rm MAINTENANCE_MODE $ENVIRONMENT || true
    
    # Redeploy without maintenance mode
    deploy_to_vercel
    
    print_success "✅ Maintenance mode disabled"
}

# Check deployment status
check_deployment() {
    print_status "🏥 Checking deployment status..."
    
    # Get latest deployment URL
    DEPLOYMENT_URL=$(vercel ls | head -n 2 | tail -n 1 | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_status "🌐 Deployment URL: https://$DEPLOYMENT_URL"
        
        # Check health endpoint
        sleep 10
        if curl -f "https://$DEPLOYMENT_URL/api/health" > /dev/null 2>&1; then
            print_success "✅ Deployment health check passed"
        else
            print_error "❌ Deployment health check failed"
            exit 1
        fi
    else
        print_error "❌ Could not determine deployment URL"
        exit 1
    fi
}

# Get deployment logs
get_logs() {
    print_status "📜 Getting deployment logs..."
    
    # Get function logs
    vercel logs --follow
}

# Rollback deployment
rollback_deployment() {
    print_status "🔄 Rolling back deployment..."
    
    # List recent deployments
    print_status "Recent deployments:"
    vercel ls --meta
    
    echo ""
    read -p "Enter deployment URL to rollback to: " ROLLBACK_URL
    
    if [ -n "$ROLLBACK_URL" ]; then
        vercel promote "$ROLLBACK_URL" --yes
        print_success "✅ Rollback completed"
    else
        print_error "❌ No deployment URL provided"
        exit 1
    fi
}

# Set up custom domain
setup_domain() {
    print_status "🌐 Setting up custom domain..."
    
    read -p "Enter your custom domain (e.g., amhsj.org): " DOMAIN
    
    if [ -n "$DOMAIN" ]; then
        vercel domains add "$DOMAIN" --yes
        print_success "✅ Domain $DOMAIN added. Please configure DNS records."
        print_status "📋 DNS Configuration:"
        print_status "Type: CNAME"
        print_status "Name: www (or @)"
        print_status "Value: cname.vercel-dns.com"
    else
        print_error "❌ No domain provided"
    fi
}

# Main deployment flow
main() {
    print_status "🎯 Starting AMHSJ Vercel deployment process..."
    
    case "$ACTION" in
        "setup")
            check_vercel_cli
            check_vercel_auth
            setup_vercel_services
            pull_env_vars
            print_success "🎉 Setup completed! You can now deploy with: ./deploy-vercel.sh production deploy"
            ;;
        "deploy")
            check_vercel_cli
            check_vercel_auth
            pull_env_vars
            build_locally
            deploy_to_vercel
            check_deployment
            print_success "🎉 Deployment completed successfully!"
            ;;
        "maintenance-on")
            check_vercel_cli
            check_vercel_auth
            enable_maintenance
            ;;
        "maintenance-off")
            check_vercel_cli
            check_vercel_auth
            disable_maintenance
            ;;
        "logs")
            check_vercel_cli
            check_vercel_auth
            get_logs
            ;;
        "rollback")
            check_vercel_cli
            check_vercel_auth
            rollback_deployment
            ;;
        "domain")
            check_vercel_cli
            check_vercel_auth
            setup_domain
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo "Environments: production, preview"
            echo "Actions: setup, deploy, maintenance-on, maintenance-off, logs, rollback, domain"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
