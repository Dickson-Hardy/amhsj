# Production Deployment Script for AMHSJ
# Usage: .\deploy.ps1 [environment] [action]

param(
    [Parameter(Position=0)]
    [string]$Environment = "production",
    
    [Parameter(Position=1)]
    [string]$Action = "deploy"
)

$ProjectName = "amhsj"
$DockerComposeFile = "docker-compose.prod.yml"

Write-Host "🚀 Starting deployment for AMHSJ - Environment: $Environment" -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

# Check if required files exist
function Test-Requirements {
    Write-Status "📋 Checking deployment requirements..."
    
    if (-not (Test-Path $DockerComposeFile)) {
        Write-Error "❌ docker-compose.prod.yml not found!"
        exit 1
    }
    
    if (-not (Test-Path ".env.production")) {
        Write-Error "❌ .env.production not found!"
        exit 1
    }
    
    if (-not (Test-Path "Dockerfile")) {
        Write-Error "❌ Dockerfile not found!"
        exit 1
    }
    
    Write-Success "✅ All required files present"
}

# Backup current deployment
function Backup-Current {
    Write-Status "💾 Creating backup of current deployment..."
    
    $runningContainers = docker-compose -f $DockerComposeFile ps -q
    if ($runningContainers) {
        # Create database backup
        if (-not (Test-Path "./backups")) {
            New-Item -ItemType Directory -Path "./backups" -Force
        }
        
        $backupFile = "./backups/db_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
        
        docker-compose -f $DockerComposeFile exec postgres pg_dump -U $env:POSTGRES_USER amhsj | Out-File -FilePath $backupFile -Encoding UTF8
        Write-Success "✅ Database backup created: $backupFile"
    } else {
        Write-Status "ℹ️  No running containers to backup"
    }
}

# Pull latest images and build
function Build-Application {
    Write-Status "🔨 Building application..."
    
    # Pull latest base images
    docker-compose -f $DockerComposeFile pull
    
    # Build the application
    docker-compose -f $DockerComposeFile build --no-cache
    
    Write-Success "✅ Application built successfully"
}

# Deploy the application
function Deploy-Application {
    Write-Status "🚢 Deploying application..."
    
    # Stop existing containers
    docker-compose -f $DockerComposeFile down
    
    # Start new containers
    docker-compose -f $DockerComposeFile up -d
    
    Write-Success "✅ Application deployed successfully"
}

# Health check
function Test-Health {
    Write-Status "🏥 Performing health check..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    # Check if containers are running
    $runningContainers = docker-compose -f $DockerComposeFile ps -q
    if ($runningContainers) {
        Write-Success "✅ Containers are running"
    } else {
        Write-Error "❌ Some containers failed to start"
        docker-compose -f $DockerComposeFile logs
        exit 1
    }
    
    # Check application health endpoint
    for ($i = 1; $i -le 10; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "✅ Application health check passed"
                break
            }
        } catch {
            if ($i -eq 10) {
                Write-Error "❌ Application health check failed after 10 attempts"
                exit 1
            }
            Write-Status "⏳ Waiting for application to start... (attempt $i/10)"
            Start-Sleep -Seconds 10
        }
    }
}

# Database migration
function Invoke-Migrations {
    Write-Status "🗃️  Running database migrations..."
    
    # Wait for database to be ready
    Start-Sleep -Seconds 10
    
    # Run migrations (adjust based on your migration setup)
    docker-compose -f $DockerComposeFile exec app npm run db:migrate
    
    Write-Success "✅ Database migrations completed"
}

# Clean up old images
function Remove-OldImages {
    Write-Status "🧹 Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old project images (keep last 2 versions)
    $oldImages = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -match $ProjectName } | Select-Object -Skip 2
    if ($oldImages) {
        $oldImages | ForEach-Object { docker rmi $_ }
    }
    
    Write-Success "✅ Cleanup completed"
}

# Enable maintenance mode
function Enable-Maintenance {
    Write-Status "🔧 Enabling maintenance mode..."
    
    # Create maintenance flag file
    docker-compose -f $DockerComposeFile exec nginx touch /tmp/maintenance_mode
    
    Write-Success "✅ Maintenance mode enabled"
}

# Disable maintenance mode
function Disable-Maintenance {
    Write-Status "✅ Disabling maintenance mode..."
    
    # Remove maintenance flag file
    docker-compose -f $DockerComposeFile exec nginx rm -f /tmp/maintenance_mode
    
    Write-Success "✅ Maintenance mode disabled"
}

# Load environment variables
function Import-Environment {
    if (Test-Path ".env.production") {
        Get-Content ".env.production" | ForEach-Object {
            if ($_ -match "^([^#].*)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
}

# Main deployment flow
function Start-Deployment {
    Write-Status "🎯 Starting AMHSJ deployment process..."
    
    # Load environment variables
    Import-Environment
    
    switch ($Action) {
        "maintenance-on" {
            Enable-Maintenance
        }
        "maintenance-off" {
            Disable-Maintenance
        }
        "backup" {
            Backup-Current
        }
        "deploy" {
            Test-Requirements
            Backup-Current
            Enable-Maintenance
            Build-Application
            Deploy-Application
            Invoke-Migrations
            Test-Health
            Disable-Maintenance
            Remove-OldImages
            Write-Success "🎉 Deployment completed successfully!"
            Write-Status "📊 Application is now running at: https://yourdomain.com"
        }
        default {
            Write-Host "Usage: .\deploy.ps1 [environment] [action]"
            Write-Host "Actions: deploy, backup, maintenance-on, maintenance-off"
            exit 1
        }
    }
}

# Run main function
Start-Deployment
