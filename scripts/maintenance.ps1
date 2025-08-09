# Production Maintenance Control Script for Windows
# Usage: .\maintenance.ps1 [enable|disable|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("enable", "disable", "status")]
    [string]$Action = "status"
)

$MAINTENANCE_FLAG_FILE = "$env:TEMP\amhsj_maintenance"
$ENV_FILE = ".env.production"

function Update-EnvVariable {
    param($Key, $Value)
    
    if (Test-Path $ENV_FILE) {
        $content = Get-Content $ENV_FILE
        $found = $false
        
        for ($i = 0; $i -lt $content.Length; $i++) {
            if ($content[$i] -match "^$Key=") {
                $content[$i] = "$Key=$Value"
                $found = $true
                break
            }
        }
        
        if (-not $found) {
            $content += "$Key=$Value"
        }
        
        $content | Set-Content $ENV_FILE
    } else {
        "$Key=$Value" | Out-File $ENV_FILE -Encoding UTF8
    }
}

function Get-EnvVariable {
    param($Key)
    
    if (Test-Path $ENV_FILE) {
        $content = Get-Content $ENV_FILE
        foreach ($line in $content) {
            if ($line -match "^$Key=(.*)") {
                return $matches[1]
            }
        }
    }
    return $null
}

function Restart-Application {
    Write-Host "🔄 Attempting to restart application..." -ForegroundColor Yellow
    
    # Try PM2 first
    if (Get-Command pm2 -ErrorAction SilentlyContinue) {
        try {
            pm2 restart amhsj
            Write-Host "✅ PM2 process restarted successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not restart PM2 process: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  PM2 not found. You may need to manually restart your application." -ForegroundColor Yellow
    }
}

switch ($Action) {
    "enable" {
        Write-Host "🔧 Enabling maintenance mode..." -ForegroundColor Blue
        
        # Update environment variables
        Update-EnvVariable "MAINTENANCE_MODE" "true"
        Update-EnvVariable "MAINTENANCE_START_TIME" (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        Update-EnvVariable "MAINTENANCE_END_TIME" ((Get-Date).AddHours(4).ToString("yyyy-MM-ddTHH:mm:ssZ"))
        Update-EnvVariable "MAINTENANCE_REASON" "Database optimization and security updates"
        Update-EnvVariable "MAINTENANCE_DURATION" "2-4 hours"
        
        # Create flag file
        New-Item -Path $MAINTENANCE_FLAG_FILE -ItemType File -Force | Out-Null
        
        Write-Host "✅ Maintenance mode enabled" -ForegroundColor Green
        Write-Host "📧 Users will be redirected to maintenance page" -ForegroundColor Cyan
        Write-Host "⏰ Scheduled end time: $((Get-Date).AddHours(4))" -ForegroundColor Cyan
        
        Restart-Application
    }
    
    "disable" {
        Write-Host "🟢 Disabling maintenance mode..." -ForegroundColor Blue
        
        # Update environment variable
        Update-EnvVariable "MAINTENANCE_MODE" "false"
        
        # Remove flag file
        if (Test-Path $MAINTENANCE_FLAG_FILE) {
            Remove-Item $MAINTENANCE_FLAG_FILE -Force
        }
        
        Write-Host "✅ Maintenance mode disabled" -ForegroundColor Green
        Write-Host "🚀 Site is now live and accessible" -ForegroundColor Cyan
        
        Restart-Application
        
        # Optionally send notifications
        Write-Host "📧 Sending recovery notifications..." -ForegroundColor Cyan
        try {
            # Invoke-RestMethod -Uri "http://localhost:3000/api/maintenance/notify" -Method POST
            Write-Host "ℹ️  Notification system would be triggered here" -ForegroundColor Gray
        } catch {
            Write-Host "⚠️  Could not send notifications: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    "status" {
        Write-Host "📊 Maintenance Status Check" -ForegroundColor Blue
        Write-Host "==========================" -ForegroundColor Blue
        
        if (Test-Path $MAINTENANCE_FLAG_FILE) {
            Write-Host "🔧 Status: MAINTENANCE MODE ACTIVE" -ForegroundColor Red
        } else {
            Write-Host "🟢 Status: SITE IS LIVE" -ForegroundColor Green
        }
        
        if (Test-Path $ENV_FILE) {
            Write-Host ""
            Write-Host "Environment Configuration:" -ForegroundColor Yellow
            $maintenanceVars = Get-Content $ENV_FILE | Where-Object { $_ -match "^MAINTENANCE_" }
            if ($maintenanceVars) {
                $maintenanceVars | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            } else {
                Write-Host "  No maintenance variables found" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        Write-Host "Process Status:" -ForegroundColor Yellow
        if (Get-Command pm2 -ErrorAction SilentlyContinue) {
            try {
                $pm2Status = pm2 list | Select-String "amhsj"
                if ($pm2Status) {
                    Write-Host "  $pm2Status" -ForegroundColor Gray
                } else {
                    Write-Host "  PM2 process 'amhsj' not found" -ForegroundColor Gray
                }
            } catch {
                Write-Host "  Could not check PM2 status" -ForegroundColor Gray
            }
        } else {
            Write-Host "  PM2 not available" -ForegroundColor Gray
        }
        
        # Show current environment
        Write-Host ""
        Write-Host "Current Settings:" -ForegroundColor Yellow
        Write-Host "  NODE_ENV: $($env:NODE_ENV)" -ForegroundColor Gray
        Write-Host "  MAINTENANCE_MODE: $(Get-EnvVariable 'MAINTENANCE_MODE')" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Usage: .\maintenance.ps1 [enable|disable|status]" -ForegroundColor DarkGray
Write-Host "Commands:" -ForegroundColor DarkGray
Write-Host "  enable  - Put site into maintenance mode" -ForegroundColor DarkGray
Write-Host "  disable - Bring site back online" -ForegroundColor DarkGray
Write-Host "  status  - Check current maintenance status" -ForegroundColor DarkGray
