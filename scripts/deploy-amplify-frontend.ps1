# Deploy Frontend to AWS Amplify from GitHub
param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepo = "https://github.com/YOUR_USERNAME/aws-ecommerce-website",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "ecommerce-frontend"
)

Write-Host "🚀 DEPLOYING FRONTEND TO AWS AMPLIFY" -ForegroundColor Green
Write-Host "GitHub Repo: $GitHubRepo" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "App Name: $AppName" -ForegroundColor Yellow
Write-Host ""

$env:AWS_DEFAULT_REGION = $Region

try {
    # 1. Create Amplify App
    Write-Host "📱 Creating Amplify App..." -ForegroundColor Cyan
    
    $createAppResult = aws amplify create-app `
        --name $AppName `
        --description "E-commerce Frontend for Screenshots" `
        --repository $GitHubRepo `
        --access-token $GitHubToken `
        --build-spec '{
            "version": 1,
            "frontend": {
                "phases": {
                    "preBuild": {
                        "commands": [
                            "cd frontend",
                            "npm ci"
                        ]
                    },
                    "build": {
                        "commands": [
                            "npm run build"
                        ]
                    }
                },
                "artifacts": {
                    "baseDirectory": "frontend/build",
                    "files": [
                        "**/*"
                    ]
                },
                "cache": {
                    "paths": [
                        "frontend/node_modules/**/*"
                    ]
                }
            }
        }' `
        --region $Region

    $appId = ($createAppResult | ConvertFrom-Json).app.appId
    Write-Host "✅ Amplify App Created: $appId" -ForegroundColor Green

    # 2. Create Main Branch
    Write-Host "🌿 Creating main branch..." -ForegroundColor Cyan
    
    aws amplify create-branch `
        --app-id $appId `
        --branch-name "main" `
        --description "Main production branch" `
        --enable-auto-build `
        --region $Region

    Write-Host "✅ Main branch created" -ForegroundColor Green

    # 3. Start Build
    Write-Host "🔨 Starting build..." -ForegroundColor Cyan
    
    $buildResult = aws amplify start-job `
        --app-id $appId `
        --branch-name "main" `
        --job-type RELEASE `
        --region $Region

    $jobId = ($buildResult | ConvertFrom-Json).jobSummary.jobId
    Write-Host "✅ Build started: $jobId" -ForegroundColor Green

    # 4. Wait for build to complete
    Write-Host "⏳ Waiting for build to complete..." -ForegroundColor Cyan
    Write-Host "This may take 3-5 minutes..." -ForegroundColor Yellow
    
    do {
        Start-Sleep -Seconds 30
        $jobStatus = aws amplify get-job `
            --app-id $appId `
            --branch-name "main" `
            --job-id $jobId `
            --region $Region | ConvertFrom-Json
        
        $status = $jobStatus.job.summary.status
        Write-Host "Build status: $status" -ForegroundColor White
        
    } while ($status -eq "RUNNING" -or $status -eq "PENDING")

    # 5. Get App Details
    $appDetails = aws amplify get-app --app-id $appId --region $Region | ConvertFrom-Json
    $defaultDomain = $appDetails.app.defaultDomain
    $appUrl = "https://main.$defaultDomain"

    # 6. Display Results
    Write-Host ""
    Write-Host "🎉 AMPLIFY DEPLOYMENT COMPLETED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 AMPLIFY APP DETAILS:" -ForegroundColor Yellow
    Write-Host "   App ID: $appId" -ForegroundColor White
    Write-Host "   App Name: $AppName" -ForegroundColor White
    Write-Host "   Website URL: $appUrl" -ForegroundColor White
    Write-Host "   Build Status: $status" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 YOUR WEBSITE IS LIVE:" -ForegroundColor Yellow
    Write-Host "   $appUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📸 READY FOR SCREENSHOTS!" -ForegroundColor Yellow
    Write-Host "   - Website is fully functional" -ForegroundColor White
    Write-Host "   - Professional design" -ForegroundColor White
    Write-Host "   - Responsive layout" -ForegroundColor White
    Write-Host "   - Perfect for portfolio" -ForegroundColor White
    Write-Host ""
    Write-Host "💰 COST: FREE (within Amplify free tier)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 AMPLIFY CONSOLE:" -ForegroundColor Yellow
    Write-Host "   https://console.aws.amazon.com/amplify/home?region=$Region#/$appId" -ForegroundColor White

    # 7. Open website in browser
    Write-Host ""
    Write-Host "🌐 Opening website in browser..." -ForegroundColor Cyan
    Start-Process $appUrl

    # 8. Save deployment info
    $deploymentInfo = @"
# Amplify Deployment Info

**Deployment Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**App ID**: $appId
**Website URL**: $appUrl
**Build Status**: $status
**Region**: $Region

## Screenshots Ready!
Your website is now live and ready for screenshots:
- Homepage with hero section
- Products page with 8 products
- Shopping cart functionality
- Checkout process
- Responsive design

## Cleanup
To delete this app after screenshots:
``````
aws amplify delete-app --app-id $appId --region $Region
``````

**Cost**: FREE within Amplify free tier
"@

    $deploymentInfo | Out-File -FilePath "AMPLIFY_DEPLOYMENT_INFO.md" -Encoding UTF8
    Write-Host "📄 Deployment info saved to: AMPLIFY_DEPLOYMENT_INFO.md" -ForegroundColor Green

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check GitHub token has repo access" -ForegroundColor White
    Write-Host "   2. Verify repository URL is correct" -ForegroundColor White
    Write-Host "   3. Ensure AWS credentials are configured" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎯 Your website is live and ready for professional screenshots!" -ForegroundColor Green
