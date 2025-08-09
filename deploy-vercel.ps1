# Vercel Deployment Script for AMHSJ
# Usage: .\deploy-vercel.ps1 [environment] [action]

param(
    [Parameter(Position=0)]
    [string]$Environment = "production",
    
    [Parameter(Position=1)]
    [string]$Action = "deploy"
)

Write-Host "🚀 Starting Vercel deployment for AMHSJ - Environment: $Environment" -ForegroundColor Blue

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

# Check if Vercel CLI is installed
function Test-VercelCLI {
    try {
        $null = Get-Command vercel -ErrorAction Stop
        Write-Success "✅ Vercel CLI found"
        return $true
    } catch {
        Write-Error "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
        Write-Success "✅ Vercel CLI installed"
        return $true
    }
}

# Check if user is logged in to Vercel
function Test-VercelAuth {
    try {
        $user = vercel whoami 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Logged in as: $user"
            return $true
        } else {
            Write-Error "❌ Not logged in to Vercel"
            Write-Status "🔑 Please log in to Vercel:"
            vercel login
            return $true
        }
    } catch {
        Write-Error "❌ Failed to check Vercel authentication"
        return $false
    }
}

# Pull environment variables
function Get-EnvironmentVariables {
    Write-Status "📥 Pulling environment variables..."
    
    try {
        vercel env pull .env.local --environment=$Environment
        
        if (Test-Path ".env.local") {
            Write-Success "✅ Environment variables pulled successfully"
        } else {
            Write-Error "❌ Failed to pull environment variables"
            exit 1
        }
    } catch {
        Write-Error "❌ Error pulling environment variables: $_"
        exit 1
    }
}

# Build locally to check for errors
function Start-LocalBuild {
    Write-Status "🔨 Building locally to check for errors..."
    
    try {
        # Install dependencies
        if (Test-Path "pnpm-lock.yaml") {
            pnpm install
            pnpm build
        } elseif (Test-Path "yarn.lock") {
            yarn install
            yarn build
        } else {
            npm install
            npm run build
        }
        
        Write-Success "✅ Local build successful"
    } catch {
        Write-Error "❌ Local build failed: $_"
        exit 1
    }
}

# Deploy to Vercel
function Start-VercelDeployment {
    Write-Status "🚢 Deploying to Vercel..."
    
    try {
        if ($Environment -eq "production") {
            # Deploy to production
            vercel --prod --yes
        } else {
            # Deploy to preview
            vercel --yes
        }
        
        Write-Success "✅ Deployment completed"
    } catch {
        Write-Error "❌ Deployment failed: $_"
        exit 1
    }
}

# Setup Vercel services (first time only)
function Initialize-VercelServices {
    Write-Status "🗄️ Setting up Vercel services..."
    
    try {
        # Check if services already exist
        $services = vercel storage ls 2>$null
        if ($services -and $services -match "amhsj") {
            Write-Status "ℹ️ Vercel services already configured"
            return
        }
        
        # Create Postgres database
        Write-Status "📊 Creating Postgres database..."
        vercel storage create postgres --name amhsj-db --yes 2>$null
        
        # Create KV store for caching
        Write-Status "🔄 Creating KV store..."
        vercel storage create kv --name amhsj-cache --yes 2>$null
        
        # Create Blob store for file uploads
        Write-Status "📁 Creating Blob storage..."
        vercel storage create blob --name amhsj-files --yes 2>$null
        
        Write-Success "✅ Vercel services setup completed"
    } catch {
        Write-Status "ℹ️ Some services may already exist or require manual setup"
    }
}

# Enable maintenance mode
function Enable-MaintenanceMode {
    Write-Status "🔧 Enabling maintenance mode..."
    
    try {
        # Add maintenance mode environment variable
        "true" | vercel env add MAINTENANCE_MODE $Environment
        
        # Redeploy with maintenance mode
        Start-VercelDeployment
        
        Write-Success "✅ Maintenance mode enabled"
    } catch {
        Write-Error "❌ Failed to enable maintenance mode: $_"
        exit 1
    }
}

# Disable maintenance mode
function Disable-MaintenanceMode {
    Write-Status "✅ Disabling maintenance mode..."
    
    try {
        # Remove maintenance mode environment variable
        vercel env rm MAINTENANCE_MODE $Environment 2>$null
        
        # Redeploy without maintenance mode
        Start-VercelDeployment
        
        Write-Success "✅ Maintenance mode disabled"
    } catch {
        Write-Error "❌ Failed to disable maintenance mode: $_"
        exit 1
    }
}

# Check deployment status
function Test-DeploymentStatus {
    Write-Status "🏥 Checking deployment status..."
    
    try {
        # Get latest deployment info
        $deployments = vercel ls | Select-Object -First 2 | Select-Object -Last 1
        
        if ($deployments) {
            $deploymentUrl = ($deployments -split '\s+')[1]
            Write-Status "🌐 Deployment URL: https://$deploymentUrl"
            
            # Check health endpoint
            Start-Sleep -Seconds 10
            
            try {
                $response = Invoke-WebRequest -Uri "https://$deploymentUrl/api/health" -UseBasicParsing -TimeoutSec 30
                if ($response.StatusCode -eq 200) {
                    Write-Success "✅ Deployment health check passed"
                } else {
                    Write-Error "❌ Deployment health check failed"
                    exit 1
                }
            } catch {
                Write-Error "❌ Deployment health check failed: $_"
                exit 1
            }
        } else {
            Write-Error "❌ Could not determine deployment URL"
            exit 1
        }
    } catch {
        Write-Error "❌ Error checking deployment status: $_"
        exit 1
    }
}

# Get deployment logs
function Get-DeploymentLogs {
    Write-Status "📜 Getting deployment logs..."
    
    try {
        vercel logs --follow
    } catch {
        Write-Error "❌ Error getting logs: $_"
    }
}

# Rollback deployment
function Start-DeploymentRollback {
    Write-Status "🔄 Rolling back deployment..."
    
    try {
        # List recent deployments
        Write-Status "Recent deployments:"
        vercel ls --meta
        
        Write-Host ""
        $rollbackUrl = Read-Host "Enter deployment URL to rollback to"
        
        if ($rollbackUrl) {
            vercel promote $rollbackUrl --yes
            Write-Success "✅ Rollback completed"
        } else {
            Write-Error "❌ No deployment URL provided"
            exit 1
        }
    } catch {
        Write-Error "❌ Rollback failed: $_"
        exit 1
    }
}

# Set up custom domain
function Set-CustomDomain {
    Write-Status "🌐 Setting up custom domain..."
    
    try {
        $domain = Read-Host "Enter your custom domain (e.g., amhsj.org)"
        
        if ($domain) {
            vercel domains add $domain --yes
            Write-Success "✅ Domain $domain added. Please configure DNS records."
            Write-Status "📋 DNS Configuration:"
            Write-Status "Type: CNAME"
            Write-Status "Name: www (or @)"
            Write-Status "Value: cname.vercel-dns.com"
        } else {
            Write-Error "❌ No domain provided"
        }
    } catch {
        Write-Error "❌ Error setting up domain: $_"
    }
}

# Main deployment flow
function Start-DeploymentProcess {
    Write-Status "🎯 Starting AMHSJ Vercel deployment process..."
    
    switch ($Action) {
        "setup" {
            Test-VercelCLI
            Test-VercelAuth
            Initialize-VercelServices
            Get-EnvironmentVariables
            Write-Success "🎉 Setup completed! You can now deploy with: .\deploy-vercel.ps1 production deploy"
        }
        "deploy" {
            Test-VercelCLI
            Test-VercelAuth
            Get-EnvironmentVariables
            Start-LocalBuild
            Start-VercelDeployment
            Test-DeploymentStatus
            Write-Success "🎉 Deployment completed successfully!"
        }
        "maintenance-on" {
            Test-VercelCLI
            Test-VercelAuth
            Enable-MaintenanceMode
        }
        "maintenance-off" {
            Test-VercelCLI
            Test-VercelAuth
            Disable-MaintenanceMode
        }
        "logs" {
            Test-VercelCLI
            Test-VercelAuth
            Get-DeploymentLogs
        }
        "rollback" {
            Test-VercelCLI
            Test-VercelAuth
            Start-DeploymentRollback
        }
        "domain" {
            Test-VercelCLI
            Test-VercelAuth
            Set-CustomDomain
        }
        default {
            Write-Host "Usage: .\deploy-vercel.ps1 [environment] [action]"
            Write-Host "Environments: production, preview"
            Write-Host "Actions: setup, deploy, maintenance-on, maintenance-off, logs, rollback, domain"
            exit 1
        }
    }
}

# Run main function
Start-DeploymentProcess
