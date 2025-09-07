# Complete E-commerce Deployment Script for Windows
# PowerShell version of the deployment script

param(
    [string]$ProjectName = "mini-ecommerce",
    [string]$Environment = "dev",
    [string]$AwsRegion = "ap-southeast-1"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"
$Purple = "Magenta"

function Write-Header {
    param([string]$Message)
    Write-Host "================================" -ForegroundColor $Purple
    Write-Host $Message -ForegroundColor $Purple
    Write-Host "================================" -ForegroundColor $Purple
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Header "CHECKING PREREQUISITES"
    
    # Check AWS CLI
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        Write-Error "AWS CLI is not installed. Please install it first."
        exit 1
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "AWS CLI not configured"
        }
    }
    catch {
        Write-Error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    }
    
    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    Write-Success "All prerequisites met!"
}

# Function to deploy infrastructure
function Deploy-Infrastructure {
    Write-Header "DEPLOYING AWS INFRASTRUCTURE"
    
    Write-Status "Deploying main infrastructure stack..."
    
    aws cloudformation deploy `
        --template-file infrastructure/main-stack.yml `
        --stack-name "$ProjectName-$Environment-infrastructure" `
        --parameter-overrides `
            ProjectName=$ProjectName `
            Environment=$Environment `
            KeyPairName="$ProjectName-keypair" `
        --capabilities CAPABILITY_IAM `
        --region $AwsRegion
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Infrastructure deployment failed"
        exit 1
    }
    
    Write-Success "Infrastructure deployment completed!"
}

# Function to deploy database
function Deploy-Database {
    Write-Header "DEPLOYING DATABASE INFRASTRUCTURE"
    
    Write-Status "Deploying DynamoDB tables and Lambda functions..."
    
    aws cloudformation deploy `
        --template-file infrastructure/database-stack.yml `
        --stack-name "$ProjectName-$Environment-database" `
        --parameter-overrides `
            ProjectName=$ProjectName `
            Environment=$Environment `
        --capabilities CAPABILITY_IAM `
        --region $AwsRegion
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Database deployment failed"
        exit 1
    }
    
    Write-Success "Database infrastructure deployed!"
}

# Function to build and deploy frontend
function Deploy-Frontend {
    Write-Header "BUILDING AND DEPLOYING FRONTEND"
    
    Write-Status "Installing frontend dependencies..."
    Set-Location frontend
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend dependency installation failed"
        Set-Location ..
        exit 1
    }
    
    Write-Status "Building React application..."
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
        Set-Location ..
        exit 1
    }
    
    Write-Status "Deploying to S3..."
    
    # Get S3 bucket name from CloudFormation
    $BucketName = aws cloudformation describe-stacks `
        --stack-name "$ProjectName-$Environment-infrastructure" `
        --region $AwsRegion `
        --query "Stacks[0].Outputs[?OutputKey=='StaticWebsiteBucket'].OutputValue" `
        --output text
    
    if (-not $BucketName -or $BucketName -eq "None") {
        Write-Error "Could not retrieve S3 bucket name from CloudFormation"
        Set-Location ..
        exit 1
    }
    
    # Deploy to S3
    aws s3 sync build/ "s3://$BucketName" `
        --delete `
        --cache-control "public, max-age=31536000" `
        --exclude "*.html" `
        --region $AwsRegion
    
    # Upload HTML files with no-cache
    aws s3 sync build/ "s3://$BucketName" `
        --cache-control "no-cache" `
        --include "*.html" `
        --region $AwsRegion
    
    Set-Location ..
    Write-Success "Frontend deployed to S3!"
}

# Function to populate sample data
function Add-SampleData {
    Write-Header "POPULATING SAMPLE DATA"
    
    Write-Status "Adding sample products to database..."
    
    # Get table name
    $ProductsTable = aws cloudformation describe-stacks `
        --stack-name "$ProjectName-$Environment-database" `
        --region $AwsRegion `
        --query "Stacks[0].Outputs[?OutputKey=='ProductsTableName'].OutputValue" `
        --output text
    
    # Create sample products
    $SampleProducts = @(
        @{
            productId = "prod-001"
            name = "Wireless Bluetooth Headphones"
            description = "Premium wireless headphones with active noise cancellation"
            price = 199.99
            category = "Electronics"
            imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
            createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            isActive = $true
        },
        @{
            productId = "prod-002"
            name = "Smart Fitness Watch"
            description = "Advanced fitness tracker with heart rate monitoring and GPS"
            price = 299.99
            category = "Electronics"
            imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
            createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            isActive = $true
        },
        @{
            productId = "prod-003"
            name = "Professional Running Shoes"
            description = "Lightweight running shoes with advanced cushioning technology"
            price = 129.99
            category = "Sports"
            imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
            createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            isActive = $true
        }
    )
    
    # Insert products
    foreach ($product in $SampleProducts) {
        $json = $product | ConvertTo-Json -Compress
        $json | Out-File -FilePath "temp-product.json" -Encoding UTF8
        
        aws dynamodb put-item `
            --table-name $ProductsTable `
            --item file://temp-product.json `
            --region $AwsRegion 2>$null
        
        Remove-Item "temp-product.json" -ErrorAction SilentlyContinue
    }
    
    Write-Success "Sample data populated!"
}

# Function to run health checks
function Test-Deployment {
    Write-Header "RUNNING HEALTH CHECKS"
    
    # Get website URL
    $WebsiteBucket = aws cloudformation describe-stacks `
        --stack-name "$ProjectName-$Environment-infrastructure" `
        --region $AwsRegion `
        --query "Stacks[0].Outputs[?OutputKey=='StaticWebsiteBucket'].OutputValue" `
        --output text
    
    $WebsiteUrl = "http://$WebsiteBucket.s3-website-$AwsRegion.amazonaws.com"
    
    Write-Status "Testing website accessibility..."
    try {
        $response = Invoke-WebRequest -Uri $WebsiteUrl -Method Head -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Website is accessible: $WebsiteUrl"
        }
    }
    catch {
        Write-Warning "Website may not be ready yet: $WebsiteUrl"
    }
}

# Function to generate deployment summary
function Show-Summary {
    Write-Header "DEPLOYMENT SUMMARY"
    
    # Get resource information
    $WebsiteBucket = aws cloudformation describe-stacks `
        --stack-name "$ProjectName-$Environment-infrastructure" `
        --region $AwsRegion `
        --query "Stacks[0].Outputs[?OutputKey=='StaticWebsiteBucket'].OutputValue" `
        --output text
    
    $WebsiteUrl = "http://$WebsiteBucket.s3-website-$AwsRegion.amazonaws.com"
    $DashboardUrl = "https://$AwsRegion.console.aws.amazon.com/cloudwatch/home?region=$AwsRegion#dashboards:name=$ProjectName-$Environment-dashboard"
    
    Write-Host ""
    Write-Host "DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Your Resources:" -ForegroundColor $Blue
    Write-Host "Website URL: $WebsiteUrl" -ForegroundColor $Blue
    Write-Host "CloudWatch Dashboard: $DashboardUrl" -ForegroundColor $Blue
    Write-Host "CloudWatch Logs: https://$AwsRegion.console.aws.amazon.com/cloudwatch/home?region=$AwsRegion#logsV2:log-groups" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Infrastructure Deployed:" -ForegroundColor $Green
    Write-Host "VPC with public/private subnets"
    Write-Host "S3 buckets for website and images"
    Write-Host "DynamoDB tables for data storage"
    Write-Host "CloudWatch monitoring and alarms"
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor $Yellow
    Write-Host "1. Visit your website: $WebsiteUrl"
    Write-Host "2. Monitor your application: CloudWatch Dashboard"
    Write-Host "3. Set up CI/CD: Push code to GitHub"
    Write-Host ""
    Write-Host "Happy selling!" -ForegroundColor $Green
}

# Main deployment function
function Start-Deployment {
    Write-Header "MINI E-COMMERCE COMPLETE DEPLOYMENT"
    Write-Host "Starting complete deployment process..." -ForegroundColor $Blue
    Write-Host ""
    
    # Run deployment steps
    Test-Prerequisites
    Deploy-Infrastructure
    Deploy-Database
    Deploy-Frontend
    Add-SampleData
    
    # Wait for services to initialize
    Write-Status "Waiting for services to initialize..."
    Start-Sleep -Seconds 30
    
    Test-Deployment
    Show-Summary
    
    Write-Success "Complete deployment finished successfully!"
}

# Run main function
try {
    Start-Deployment
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
