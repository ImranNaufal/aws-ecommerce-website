# Deploy Monitoring and Additional AWS Services
# PowerShell script for comprehensive AWS deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "mini-ecommerce",
    
    [Parameter(Mandatory=$false)]
    [string]$NotificationEmail = "admin@example.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1"
)

Write-Host "🚀 Deploying Additional AWS Services for E-commerce Website" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project: $ProjectName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Notification Email: $NotificationEmail" -ForegroundColor Yellow
Write-Host ""

# Set AWS Region
$env:AWS_DEFAULT_REGION = $Region

try {
    # 1. Deploy CloudWatch Monitoring and SNS
    Write-Host "📊 Deploying CloudWatch Monitoring and SNS Notifications..." -ForegroundColor Cyan
    
    $monitoringStackName = "$ProjectName-$Environment-monitoring"
    
    aws cloudformation deploy `
        --template-file "infrastructure/monitoring-template.yaml" `
        --stack-name $monitoringStackName `
        --parameter-overrides `
            ProjectName=$ProjectName `
            Environment=$Environment `
            NotificationEmail=$NotificationEmail `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Monitoring stack deployed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to deploy monitoring stack"
    }

    # 2. Deploy Lambda Functions
    Write-Host "⚡ Deploying Lambda Functions..." -ForegroundColor Cyan
    
    $lambdaStackName = "$ProjectName-$Environment-lambda"
    
    aws cloudformation deploy `
        --template-file "infrastructure/lambda-functions.yaml" `
        --stack-name $lambdaStackName `
        --parameter-overrides `
            ProjectName=$ProjectName `
            Environment=$Environment `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lambda functions deployed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to deploy Lambda functions"
    }

    # 3. Deploy API Gateway
    Write-Host "🌐 Deploying API Gateway..." -ForegroundColor Cyan
    
    # Get EC2 instance private IP (you may need to update this)
    $ec2InstanceIP = "10.0.1.100"  # Update with actual private IP
    
    $apiStackName = "$ProjectName-$Environment-api-gateway"
    
    aws cloudformation deploy `
        --template-file "infrastructure/api-gateway-template.yaml" `
        --stack-name $apiStackName `
        --parameter-overrides `
            ProjectName=$ProjectName `
            Environment=$Environment `
            EC2InstanceIP=$ec2InstanceIP `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API Gateway deployed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to deploy API Gateway"
    }

    # 4. Get Stack Outputs
    Write-Host "📋 Retrieving Stack Information..." -ForegroundColor Cyan
    
    # Get API Gateway URL
    $apiUrl = aws cloudformation describe-stacks `
        --stack-name $apiStackName `
        --query "Stacks[0].Outputs[?OutputKey=='APIGatewayURL'].OutputValue" `
        --output text `
        --region $Region
    
    # Get Dashboard URL
    $dashboardUrl = aws cloudformation describe-stacks `
        --stack-name $monitoringStackName `
        --query "Stacks[0].Outputs[?OutputKey=='DashboardURL'].OutputValue" `
        --output text `
        --region $Region
    
    # Get SNS Topic ARN
    $snsTopicArn = aws cloudformation describe-stacks `
        --stack-name $monitoringStackName `
        --query "Stacks[0].Outputs[?OutputKey=='AlertsTopicArn'].OutputValue" `
        --output text `
        --region $Region

    # 5. Display Results
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 MONITORING & ALERTS:" -ForegroundColor Yellow
    Write-Host "   CloudWatch Dashboard: $dashboardUrl" -ForegroundColor White
    Write-Host "   SNS Topic ARN: $snsTopicArn" -ForegroundColor White
    Write-Host "   Email Notifications: $NotificationEmail" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 API GATEWAY:" -ForegroundColor Yellow
    Write-Host "   API URL: $apiUrl" -ForegroundColor White
    Write-Host "   Environment: $Environment" -ForegroundColor White
    Write-Host ""
    Write-Host "⚡ LAMBDA FUNCTIONS:" -ForegroundColor Yellow
    Write-Host "   Order Processing: $ProjectName-$Environment-order-processing" -ForegroundColor White
    Write-Host "   Inventory Management: $ProjectName-$Environment-inventory-management" -ForegroundColor White
    Write-Host "   Analytics: $ProjectName-$Environment-analytics" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "   1. Check your email to confirm SNS subscription" -ForegroundColor White
    Write-Host "   2. View CloudWatch Dashboard for monitoring" -ForegroundColor White
    Write-Host "   3. Test API Gateway endpoints" -ForegroundColor White
    Write-Host "   4. Configure frontend to use API Gateway URL" -ForegroundColor White
    Write-Host ""

    # 6. Create deployment summary file
    $summaryFile = "DEPLOYMENT_SUMMARY.md"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $summaryContent = @"
# AWS E-commerce Deployment Summary

**Deployment Date**: $timestamp
**Environment**: $Environment
**Region**: $Region

## 🚀 Deployed Services

### Core Infrastructure
- ✅ VPC and Networking
- ✅ EC2 Instance for Backend
- ✅ S3 Bucket for Frontend
- ✅ DynamoDB Tables

### Monitoring & Alerts
- ✅ CloudWatch Dashboard: $dashboardUrl
- ✅ SNS Topic: $snsTopicArn
- ✅ Email Notifications: $NotificationEmail
- ✅ Custom Metrics and Alarms

### Serverless Functions
- ✅ Order Processing Lambda
- ✅ Inventory Management Lambda
- ✅ Analytics Lambda
- ✅ Scheduled Analytics (Daily)

### API Management
- ✅ API Gateway: $apiUrl
- ✅ Usage Plans and API Keys
- ✅ Rate Limiting and Throttling
- ✅ CloudWatch Logging

## 📊 Monitoring Features

- **CPU Usage Alerts**: > 80%
- **Memory Usage Alerts**: > 85%
- **Application Error Alerts**: > 5 errors/5min
- **DynamoDB Throttling Alerts**
- **Custom Application Metrics**

## 🔧 Management URLs

- **CloudWatch Dashboard**: $dashboardUrl
- **API Gateway Console**: https://console.aws.amazon.com/apigateway/
- **Lambda Console**: https://console.aws.amazon.com/lambda/
- **DynamoDB Console**: https://console.aws.amazon.com/dynamodb/

## 📈 Analytics & Insights

- **Daily Analytics**: Automated via Lambda
- **Order Tracking**: Real-time order processing
- **Inventory Management**: Automated stock updates
- **Performance Monitoring**: Response times and errors

---

**Total AWS Services Used**: 15+
**Infrastructure as Code**: 100% CloudFormation
**Monitoring Coverage**: Complete
**Serverless Functions**: 3 Lambda functions
**API Management**: Full API Gateway integration
"@

    $summaryContent | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-Host "📄 Deployment summary saved to: $summaryFile" -ForegroundColor Green

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Your AWS E-commerce platform is now fully deployed with enterprise-grade monitoring and serverless capabilities!" -ForegroundColor Green
