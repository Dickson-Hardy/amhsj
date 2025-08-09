# Production Configuration Setup Script for Windows
# This script sets up the production environment for AMHSJ on Windows

param(
    [switch]$SkipSSL,
    [switch]$SkipDocker,
    [string]$Domain = "amhsj.org"
)

# Color functions for output
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Create production environment file
function Setup-ProductionEnv {
    Write-Info "Setting up production environment variables..."
    
    if (-not (Test-Path ".env.production")) {
        Copy-Item ".env.local" ".env.production"
        Write-Success "Created .env.production from .env.local"
    } else {
        Write-Warning ".env.production already exists, skipping..."
    }

    # Add production-specific environment variables
    $productionEnvContent = @"

# Production Environment Settings
NODE_ENV=production
ENABLE_REAL_APIS=true
ENABLE_MONITORING=true
ENABLE_ANALYTICS=true
ENABLE_SECURITY_HEADERS=true

# Production URLs
NEXT_PUBLIC_APP_URL=https://$Domain
NEXTAUTH_URL=https://$Domain

# Production Database (Update with your production DB)
# DATABASE_URL=postgresql://prod_user:prod_password@prod-db-host:5432/amhsj_prod

# Production Redis (Update with your production Redis)
# UPSTASH_REDIS_REST_URL=https://your-prod-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-prod-redis-token

# SSL Configuration (Windows paths)
SSL_CERT_PATH=C:\ssl\certs\amhsj.crt
SSL_KEY_PATH=C:\ssl\private\amhsj.key

# Backup Configuration
BACKUP_S3_BUCKET=amhsj-backups
BACKUP_SCHEDULE="0 2 * * *"

# Rate Limiting (Production values)
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_REQUESTS_PER_HOUR=1000

# Security
ENABLE_CSRF_PROTECTION=true
ENABLE_RATE_LIMITING=true
CORS_ORIGIN=https://$Domain

"@

    Add-Content -Path ".env.production" -Value $productionEnvContent
    Write-Success "Added production environment variables"
}

# Setup SSL certificates
function Setup-SSL {
    if ($SkipSSL) {
        Write-Warning "Skipping SSL setup as requested"
        return
    }

    Write-Info "Setting up SSL certificate directories..."
    
    $sslDir = "C:\ssl"
    $certsDir = "$sslDir\certs"
    $privateDir = "$sslDir\private"
    
    if (-not (Test-Path $sslDir)) { New-Item -ItemType Directory -Path $sslDir -Force | Out-Null }
    if (-not (Test-Path $certsDir)) { New-Item -ItemType Directory -Path $certsDir -Force | Out-Null }
    if (-not (Test-Path $privateDir)) { New-Item -ItemType Directory -Path $privateDir -Force | Out-Null }
    
    # Set appropriate permissions
    if (Test-Administrator) {
        $acl = Get-Acl $privateDir
        $acl.SetAccessRuleProtection($true, $false)
        $adminRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "Allow")
        $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule("SYSTEM", "FullControl", "Allow")
        $acl.SetAccessRule($adminRule)
        $acl.SetAccessRule($systemRule)
        Set-Acl -Path $privateDir -AclObject $acl
    }
    
    Write-Success "SSL directories created"
    Write-Warning "You'll need to obtain real SSL certificates for production"
    Write-Info "Consider using Let's Encrypt or a commercial CA"
}

# Setup logging directories
function Setup-Logging {
    Write-Info "Setting up logging directories..."
    
    $logDirs = @("logs\app", "logs\access", "logs\error", "logs\security")
    foreach ($dir in $logDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Success "Logging directories created"
}

# Setup backup directories and script
function Setup-Backup {
    Write-Info "Setting up backup configuration..."
    
    $backupDirs = @("backups\database", "backups\files", "backups\config")
    foreach ($dir in $backupDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    # Create backup script
    $backupScript = @'
# AMHSJ Backup Script for Windows
param(
    [string]$BackupPath = ".\backups"
)

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$DatabaseBackupFile = "$BackupPath\database\amhsj_$Date.sql"

Write-Host "Starting backup at $(Get-Date)"

# Database backup (requires pg_dump in PATH)
if ($env:DATABASE_URL) {
    Write-Host "Backing up database..."
    try {
        & pg_dump $env:DATABASE_URL | Out-File -FilePath $DatabaseBackupFile -Encoding UTF8
        Compress-Archive -Path $DatabaseBackupFile -DestinationPath "$DatabaseBackupFile.zip"
        Remove-Item $DatabaseBackupFile
        Write-Host "Database backup completed: $DatabaseBackupFile.zip"
    } catch {
        Write-Warning "Database backup failed: $_"
    }
}

# Files backup
Write-Host "Backing up uploaded files..."
if (Test-Path "public\uploads") {
    Compress-Archive -Path "public\uploads\*" -DestinationPath "$BackupPath\files\files_$Date.zip" -Force
}

# Configuration backup
Write-Host "Backing up configuration..."
if (Test-Path ".env.production") {
    Copy-Item ".env.production" "$BackupPath\config\env_$Date.backup"
}

# Cleanup old backups (keep 30 days)
$cutoffDate = (Get-Date).AddDays(-30)
Get-ChildItem "$BackupPath" -Recurse -File | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force

Write-Host "Backup completed at $(Get-Date)"
'@

    $backupScript | Out-File -FilePath "scripts\backup.ps1" -Encoding UTF8
    Write-Success "Backup configuration created"
}

# Setup monitoring configuration
function Setup-Monitoring {
    Write-Info "Setting up monitoring configuration..."
    
    $monitoringConfig = @{
        healthChecks = @{
            interval = 60000
            timeout = 5000
            endpoints = @("/api/monitoring/health", "/api/health")
        }
        alerts = @{
            email = "admin@$Domain"
            slack = @{
                webhook = ""
                channel = "#alerts"
            }
        }
        metrics = @{
            retention = "30d"
            aggregation = "1m"
        }
    }
    
    $monitoringConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "monitoring.json" -Encoding UTF8
    Write-Success "Monitoring configuration created"
}

# Setup Windows Service configuration
function Setup-WindowsService {
    Write-Info "Setting up Windows Service configuration..."
    
    $serviceScript = @"
# Windows Service Setup for AMHSJ
# Run this script as Administrator to install the service

# Install Node.js Windows Service Helper (if not already installed)
# npm install -g node-windows

# Create service script
`$serviceJs = @'
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name: 'AMHSJ Journal',
  description: 'AMHSJ Academic Journal Platform',
  script: require('path').join(__dirname, 'server.js'),
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function(){
  console.log('AMHSJ service installed successfully');
  svc.start();
});

// Install the service
svc.install();
'@

`$serviceJs | Out-File -FilePath 'install-service.js' -Encoding UTF8

Write-Host "To install as Windows Service:"
Write-Host "1. Install node-windows: npm install -g node-windows"
Write-Host "2. Run as Administrator: node install-service.js"
"@

    $serviceScript | Out-File -FilePath "scripts\setup-windows-service.ps1" -Encoding UTF8
    Write-Success "Windows Service configuration created"
}

# Setup Docker production configuration
function Setup-DockerProduction {
    if ($SkipDocker) {
        Write-Warning "Skipping Docker setup as requested"
        return
    }

    Write-Info "Setting up Docker production configuration..."
    
    # Docker Compose for Windows
    $dockerCompose = @"
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./backups:/app/backups
    networks:
      - amhsj-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=amhsj_prod
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/database:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - amhsj-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass `${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - amhsj-network

volumes:
  postgres_data:
  redis_data:

networks:
  amhsj-network:
    driver: bridge
"@

    $dockerCompose | Out-File -FilePath "docker-compose.prod.yml" -Encoding UTF8
    
    # Production Dockerfile
    $dockerfile = @"
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm install -g pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create logs directory
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
"@

    $dockerfile | Out-File -FilePath "Dockerfile.prod" -Encoding UTF8
    Write-Success "Docker production configuration created"
}

# Setup IIS configuration (Windows-specific)
function Setup-IIS {
    Write-Info "Setting up IIS configuration..."
    
    $webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- IIS Node.js configuration -->
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    
    <!-- URL Rewriting -->
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    
    <!-- Security Headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
      </customHeaders>
    </httpProtocol>
    
    <!-- Error handling -->
    <iisnode
      node_env="production"
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="3"
      namedPipeConnectionTimeout="30000"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="*.js"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectoryNameSuffix="logs"
      debuggingEnabled="false"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="true"
      promoteServerVars="LOGON_USER" />
  </system.webServer>
</configuration>
"@

    $webConfig | Out-File -FilePath "web.config" -Encoding UTF8
    Write-Success "IIS configuration created (web.config)"
    Write-Info "Install iisnode module: https://github.com/azure/iisnode"
}

# Main setup function
function Main {
    Write-Info "Starting AMHSJ Production Configuration Setup for Windows"
    Write-Info "========================================================"
    
    if (-not (Test-Administrator)) {
        Write-Warning "Running without administrator privileges. Some configurations may be limited."
    }
    
    # Create necessary directories
    $directories = @("scripts", "ssl", "logs", "backups")
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    # Run setup functions
    Setup-ProductionEnv
    Setup-SSL
    Setup-Logging
    Setup-Backup
    Setup-Monitoring
    Setup-WindowsService
    Setup-DockerProduction
    Setup-IIS
    
    Write-Info ""
    Write-Info "========================================================"
    Write-Success "Production configuration setup completed!"
    Write-Info "========================================================"
    Write-Info ""
    
    # Display next steps
    Write-Host "Next Steps:" -ForegroundColor Blue
    Write-Host "1. Update .env.production with your actual API keys and database URLs"
    Write-Host "2. Obtain and install real SSL certificates"
    Write-Host "3. Configure your domain DNS to point to your server"
    Write-Host "4. Choose deployment method (IIS, Docker, or Node.js service)"
    Write-Host "5. Set up database backups and monitoring"
    Write-Host "6. Test all configurations before going live"
    Write-Host ""
    Write-Host "Important Files Created:" -ForegroundColor Yellow
    Write-Host "- .env.production (Environment variables)"
    Write-Host "- docker-compose.prod.yml (Production Docker setup)"
    Write-Host "- web.config (IIS configuration)"
    Write-Host "- scripts\backup.ps1 (Backup script)"
    Write-Host "- monitoring.json (Monitoring configuration)"
    Write-Host "- scripts\setup-windows-service.ps1 (Windows Service setup)"
    Write-Host ""
    Write-Host "Production deployment ready! 🚀" -ForegroundColor Green
    
    # Deployment options
    Write-Host ""
    Write-Host "Deployment Options:" -ForegroundColor Cyan
    Write-Host "1. IIS: Use web.config with iisnode module"
    Write-Host "2. Docker: Run docker-compose -f docker-compose.prod.yml up"
    Write-Host "3. Windows Service: Use scripts\setup-windows-service.ps1"
    Write-Host "4. PM2: npm install -g pm2; pm2 start ecosystem.config.js --env production"
}

# Run main function
Main
