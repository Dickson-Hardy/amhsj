# Test registration endpoint
$testData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    affiliation = "Test University"
    role = "author"
    researchInterests = @("IoT", "Smart Systems")
} | ConvertTo-Json

Write-Host "Sending registration request..."
Write-Host "Data: $testData"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "Success: $($response | ConvertTo-Json -Depth 10)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.Exception.Response | ConvertFrom-Json -ErrorAction SilentlyContinue
    Write-Host "Error $statusCode : $($errorBody | ConvertTo-Json -Depth 10)"
    Write-Host "Raw error: $($_.Exception.Message)"
}
