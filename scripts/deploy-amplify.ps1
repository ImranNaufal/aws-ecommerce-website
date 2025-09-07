# Deploy AWS Amplify App with CI/CD Pipeline
# PowerShell script for Amplify deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "mini-ecommerce",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepo = "https://github.com/your-username/aws-ecommerce-website",
    
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$CustomDomain = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1"
)

Write-Host "🚀 Deploying AWS Amplify App for E-commerce Website" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project: $ProjectName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "GitHub Repo: $GitHubRepo" -ForegroundColor Yellow
if ($CustomDomain) {
    Write-Host "Custom Domain: $CustomDomain" -ForegroundColor Yellow
}
Write-Host ""

# Set AWS Region
$env:AWS_DEFAULT_REGION = $Region

try {
    # 1. Deploy Amplify App
    Write-Host "📱 Deploying AWS Amplify App..." -ForegroundColor Cyan
    
    $amplifyStackName = "$ProjectName-$Environment-amplify"
    
    $parameters = @(
        "ProjectName=$ProjectName",
        "Environment=$Environment",
        "GitHubRepository=$GitHubRepo",
        "GitHubAccessToken=$GitHubToken"
    )
    
    if ($CustomDomain) {
        $parameters += "DomainName=$CustomDomain"
    }
    
    aws cloudformation deploy `
        --template-file "infrastructure/amplify-app-template.yaml" `
        --stack-name $amplifyStackName `
        --parameter-overrides $parameters `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Amplify app deployed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to deploy Amplify app"
    }

    # 2. Get Amplify App Information
    Write-Host "📋 Retrieving Amplify App Information..." -ForegroundColor Cyan
    
    # Get App ID
    $appId = aws cloudformation describe-stacks `
        --stack-name $amplifyStackName `
        --query "Stacks[0].Outputs[?OutputKey=='AmplifyAppId'].OutputValue" `
        --output text `
        --region $Region
    
    # Get Default Domain
    $defaultDomain = aws cloudformation describe-stacks `
        --stack-name $amplifyStackName `
        --query "Stacks[0].Outputs[?OutputKey=='DefaultDomain'].OutputValue" `
        --output text `
        --region $Region
    
    # Get App URL
    $appUrl = aws cloudformation describe-stacks `
        --stack-name $amplifyStackName `
        --query "Stacks[0].Outputs[?OutputKey=='AppURL'].OutputValue" `
        --output text `
        --region $Region
    
    # Get Console URL
    $consoleUrl = aws cloudformation describe-stacks `
        --stack-name $amplifyStackName `
        --query "Stacks[0].Outputs[?OutputKey=='AmplifyConsoleURL'].OutputValue" `
        --output text `
        --region $Region

    # 3. Trigger Initial Build
    Write-Host "🔨 Triggering initial build..." -ForegroundColor Cyan
    
    aws amplify start-job `
        --app-id $appId `
        --branch-name "main" `
        --job-type RELEASE `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Initial build started successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Could not start initial build automatically" -ForegroundColor Yellow
    }

    # 4. Configure Environment Variables (if API Gateway exists)
    Write-Host "⚙️ Configuring environment variables..." -ForegroundColor Cyan
    
    try {
        $apiId = aws cloudformation describe-stacks `
            --stack-name "$ProjectName-$Environment-api-gateway" `
            --query "Stacks[0].Outputs[?OutputKey=='APIGatewayId'].OutputValue" `
            --output text `
            --region $Region 2>$null
        
        if ($apiId -and $apiId -ne "None") {
            $apiUrl = "https://$apiId.execute-api.$Region.amazonaws.com/$Environment"
            
            aws amplify update-branch `
                --app-id $appId `
                --branch-name "main" `
                --environment-variables "REACT_APP_API_ENDPOINT=$apiUrl,REACT_APP_ENVIRONMENT=$Environment,REACT_APP_REGION=$Region" `
                --region $Region
            
            Write-Host "✅ Environment variables configured with API Gateway URL" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ API Gateway not found, using default environment variables" -ForegroundColor Blue
        }
    } catch {
        Write-Host "ℹ️ Using default environment variables" -ForegroundColor Blue
    }

    # 5. Display Results
    Write-Host ""
    Write-Host "🎉 AMPLIFY DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 AMPLIFY APP DETAILS:" -ForegroundColor Yellow
    Write-Host "   App ID: $appId" -ForegroundColor White
    Write-Host "   App URL: $appUrl" -ForegroundColor White
    Write-Host "   Default Domain: $defaultDomain" -ForegroundColor White
    Write-Host "   Console URL: $consoleUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 CI/CD PIPELINE:" -ForegroundColor Yellow
    Write-Host "   GitHub Repository: $GitHubRepo" -ForegroundColor White
    Write-Host "   Auto-Build: Enabled on main branch" -ForegroundColor White
    Write-Host "   Build Status: Initial build started" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 DEPLOYMENT FEATURES:" -ForegroundColor Yellow
    Write-Host "   ✅ Automatic deployments from GitHub" -ForegroundColor White
    Write-Host "   ✅ Branch-based environments" -ForegroundColor White
    Write-Host "   ✅ Custom headers for security" -ForegroundColor White
    Write-Host "   ✅ SPA routing support" -ForegroundColor White
    Write-Host "   ✅ Performance optimization" -ForegroundColor White
    Write-Host ""
    
    if ($CustomDomain) {
        $customUrl = aws cloudformation describe-stacks `
            --stack-name $amplifyStackName `
            --query "Stacks[0].Outputs[?OutputKey=='CustomDomainURL'].OutputValue" `
            --output text `
            --region $Region
        
        Write-Host "🌍 CUSTOM DOMAIN:" -ForegroundColor Yellow
        Write-Host "   Custom URL: $customUrl" -ForegroundColor White
        Write-Host "   SSL Certificate: Automatically provisioned" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "🔧 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "   1. Monitor build progress in Amplify Console" -ForegroundColor White
    Write-Host "   2. Push code changes to GitHub for automatic deployment" -ForegroundColor White
    Write-Host "   3. Configure custom domain (if needed)" -ForegroundColor White
    Write-Host "   4. Set up branch-based environments" -ForegroundColor White
    Write-Host ""

    # 6. Create Amplify summary file
    $summaryFile = "AMPLIFY_DEPLOYMENT_SUMMARY.md"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $summaryContent = @"
# AWS Amplify Deployment Summary

**Deployment Date**: $timestamp
**Environment**: $Environment
**Region**: $Region

## 🚀 Amplify App Details

- **App ID**: $appId
- **App URL**: $appUrl
- **Default Domain**: $defaultDomain
- **Console URL**: $consoleUrl

## 🔄 CI/CD Pipeline

- **GitHub Repository**: $GitHubRepo
- **Auto-Build**: Enabled on main branch
- **Build Triggers**: Push to main branch
- **Environment Variables**: Configured for API integration

## 🌐 Features Enabled

- ✅ **Automatic Deployments**: From GitHub repository
- ✅ **Branch-based Environments**: Support for multiple environments
- ✅ **Custom Headers**: Security headers configured
- ✅ **SPA Routing**: Single Page Application support
- ✅ **Performance Mode**: Optimized for fast loading
- ✅ **SSL/TLS**: Automatic HTTPS encryption

## 📊 Build Configuration

- **Build Spec**: Custom amplify.yml configuration
- **Node.js Version**: Latest LTS
- **Build Cache**: Enabled for faster builds
- **Artifacts**: Optimized React build output

## 🔧 Management

- **Amplify Console**: $consoleUrl
- **Build Logs**: Available in Amplify Console
- **Environment Variables**: Configured via CloudFormation
- **Custom Domain**: $(if ($CustomDomain) { "Configured" } else { "Not configured" })

---

**Your e-commerce website is now deployed with AWS Amplify CI/CD pipeline!**
Every push to the main branch will automatically trigger a new deployment.
"@

    $summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-Host "📄 Amplify deployment summary saved to: $summaryFile" -ForegroundColor Green

} catch {
    Write-Host "❌ Amplify deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "   1. Verify GitHub token has repo access" -ForegroundColor White
    Write-Host "   2. Check repository URL is correct" -ForegroundColor White
    Write-Host "   3. Ensure AWS credentials are configured" -ForegroundColor White
    Write-Host "   4. Verify CloudFormation permissions" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎯 Your AWS Amplify CI/CD pipeline is now active!" -ForegroundColor Green
Write-Host "Push code changes to GitHub and watch automatic deployments! 🚀" -ForegroundColor Green
