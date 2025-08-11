# =========================================================================
# AMHSJ Role Setup Script
# =========================================================================
# PowerShell script to set up all academic journal roles in the database
# =========================================================================

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [switch]$Verbose,
    [switch]$DryRun
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  AMHSJ Academic Journal Role Setup     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is provided
if (-not $DatabaseUrl) {
    Write-Host "Error: DATABASE_URL not provided." -ForegroundColor Red
    Write-Host "Please set the DATABASE_URL environment variable or pass it as a parameter." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example usage:" -ForegroundColor Green
    Write-Host "  .\setup-roles.ps1 -DatabaseUrl 'postgresql://user:password@host:port/database'" -ForegroundColor Green
    Write-Host "  .\setup-roles.ps1 -Verbose" -ForegroundColor Green
    exit 1
}

# Check if psql is available
$psqlCommand = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCommand) {
    Write-Host "Error: PostgreSQL psql command not found." -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools." -ForegroundColor Yellow
    exit 1
}

$scriptPath = Join-Path $PSScriptRoot "setup-roles.sql"

# Check if SQL script exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: SQL script not found at: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Database URL: $($DatabaseUrl -replace 'postgresql://[^@]*@', 'postgresql://***@')" -ForegroundColor Gray
Write-Host "  SQL Script: $scriptPath" -ForegroundColor Gray
Write-Host "  Dry Run: $DryRun" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes will be made to the database" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL Script Contents Preview:" -ForegroundColor Cyan
    Get-Content $scriptPath | Select-Object -First 50 | ForEach-Object { 
        Write-Host "  $_" -ForegroundColor Gray 
    }
    Write-Host "  ... (script continues)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To execute for real, run without -DryRun flag" -ForegroundColor Green
    exit 0
}

# Confirm execution
Write-Host "This will create all academic journal roles and sample data in your database." -ForegroundColor Yellow
$confirmation = Read-Host "Are you sure you want to proceed? (y/N)"

if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing role setup..." -ForegroundColor Green

try {
    # Execute the SQL script
    $psqlArgs = @(
        $DatabaseUrl,
        "-f", $scriptPath
    )
    
    if ($Verbose) {
        $psqlArgs += @("-v", "ON_ERROR_STOP=1", "-a")
    } else {
        $psqlArgs += @("-v", "ON_ERROR_STOP=1", "-q")
    }
    
    Write-Host "Running: psql [DATABASE_URL] -f $scriptPath" -ForegroundColor Gray
    Write-Host ""
    
    $result = & psql @psqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "         SETUP COMPLETED SUCCESSFULLY    " -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Roles created:" -ForegroundColor Cyan
        Write-Host "  ✓ System Administrator (admin)" -ForegroundColor Green
        Write-Host "  ✓ Editor-in-Chief (editor-in-chief)" -ForegroundColor Green
        Write-Host "  ✓ Managing Editor (managing-editor)" -ForegroundColor Green
        Write-Host "  ✓ Section Editors (section-editor)" -ForegroundColor Green
        Write-Host "  ✓ Production Editor (production-editor)" -ForegroundColor Green
        Write-Host "  ✓ Guest Editor (guest-editor)" -ForegroundColor Green
        Write-Host "  ✓ Associate Editors (editor)" -ForegroundColor Green
        Write-Host "  ✓ Peer Reviewers (reviewer)" -ForegroundColor Green
        Write-Host "  ✓ Authors (author)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Sample login credentials:" -ForegroundColor Cyan
        Write-Host "  Admin: admin@amhsj.org / password123" -ForegroundColor Yellow
        Write-Host "  EIC: eic@amhsj.org / password123" -ForegroundColor Yellow
        Write-Host "  Managing: managing@amhsj.org / password123" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Note: Change default passwords in production!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Start your application: npm run dev" -ForegroundColor White
        Write-Host "  2. Login with any of the above credentials" -ForegroundColor White
        Write-Host "  3. Test the role-based workflows" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Error: Setup failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        exit $LASTEXITCODE
    }
    
} catch {
    Write-Host ""
    Write-Host "Error executing setup script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Optional: Run verification queries
$verifyChoice = Read-Host "Would you like to run verification queries to check the setup? (y/N)"

if ($verifyChoice -eq "y" -or $verifyChoice -eq "Y") {
    Write-Host ""
    Write-Host "Running verification queries..." -ForegroundColor Cyan
    
    $verificationQuery = @"
-- Role Summary
SELECT 'ROLE SUMMARY' as report_type, '' as details
UNION ALL
SELECT role, COUNT(*)::text || ' users' as details
FROM users 
GROUP BY role 
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'editor-in-chief' THEN 2
        WHEN 'managing-editor' THEN 3
        WHEN 'section-editor' THEN 4
        WHEN 'production-editor' THEN 5
        WHEN 'guest-editor' THEN 6
        WHEN 'editor' THEN 7
        WHEN 'reviewer' THEN 8
        WHEN 'author' THEN 9
        ELSE 10
    END;
"@

    echo $verificationQuery | psql $DatabaseUrl
    
    Write-Host ""
    Write-Host "Verification complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Role setup script completed successfully!" -ForegroundColor Green
