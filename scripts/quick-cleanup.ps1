# Quick AWS Cleanup Script
param(
    [string]$Region = "ap-southeast-1",
    [string]$ProjectName = "mini-ecommerce",
    [string]$Environment = "dev"
)

Write-Host "🧹 CLEANING UP AWS SERVICES" -ForegroundColor Red
Write-Host "Region: $Region" -ForegroundColor Yellow

$env:AWS_DEFAULT_REGION = $Region

# Delete CloudFormation Stacks
Write-Host "🗑️ Deleting CloudFormation Stacks..." -ForegroundColor Cyan

$stacks = @(
    "$ProjectName-$Environment-amplify",
    "$ProjectName-$Environment-api-gateway", 
    "$ProjectName-$Environment-lambda",
    "$ProjectName-$Environment-monitoring",
    "$ProjectName-$Environment-infrastructure",
    "$ProjectName-$Environment-ec2"
)

foreach ($stackName in $stacks) {
    Write-Host "Deleting: $stackName" -ForegroundColor White
    aws cloudformation delete-stack --stack-name $stackName --region $Region
}

# Terminate EC2 instances
Write-Host "🖥️ Terminating EC2 instances..." -ForegroundColor Cyan
$instances = aws ec2 describe-instances --filters "Name=tag:Project,Values=$ProjectName" --query "Reservations[*].Instances[*].InstanceId" --output text --region $Region

if ($instances) {
    $instanceList = $instances -split '\s+'
    foreach ($instanceId in $instanceList) {
        if ($instanceId.Trim()) {
            Write-Host "Terminating: $instanceId" -ForegroundColor White
            aws ec2 terminate-instances --instance-ids $instanceId --region $Region
        }
    }
}

Write-Host ""
Write-Host "✅ CLEANUP INITIATED!" -ForegroundColor Green
Write-Host "Resources are being deleted. This may take 10-15 minutes." -ForegroundColor Yellow
Write-Host ""
Write-Host "💰 This will reduce your AWS costs to ~$1-5/month" -ForegroundColor Green
Write-Host "🚀 Your GitHub repository still shows complete AWS expertise!" -ForegroundColor Green
