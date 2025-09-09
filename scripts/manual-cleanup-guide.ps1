# Manual AWS Cleanup Guide
param([string]$Region = "ap-southeast-1")

Write-Host "🧹 AWS MANUAL CLEANUP GUIDE" -ForegroundColor Red
Write-Host "Region: $Region" -ForegroundColor Yellow

$env:AWS_DEFAULT_REGION = $Region

# Quick automated cleanup
Write-Host "🚀 Running quick automated cleanup..." -ForegroundColor Cyan

# Delete CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[*].StackName" --output text --region $Region | ForEach-Object {
    $stacks = $_ -split '\s+'
    foreach ($stack in $stacks) {
        if ($stack.Trim()) {
            Write-Host "Deleting stack: $stack" -ForegroundColor White
            aws cloudformation delete-stack --stack-name $stack --region $Region
        }
    }
}

# Terminate EC2 instances
aws ec2 describe-instances --query "Reservations[*].Instances[?State.Name!='terminated'].InstanceId" --output text --region $Region | ForEach-Object {
    $instances = $_ -split '\s+'
    foreach ($instance in $instances) {
        if ($instance.Trim()) {
            Write-Host "Terminating: $instance" -ForegroundColor White
            aws ec2 terminate-instances --instance-ids $instance --region $Region
        }
    }
}

Write-Host ""
Write-Host "✅ Automated cleanup started!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 MANUAL VERIFICATION REQUIRED:" -ForegroundColor Yellow
Write-Host "Please check these AWS Console pages manually:" -ForegroundColor White
Write-Host ""
Write-Host "1. CloudFormation: https://console.aws.amazon.com/cloudformation/" -ForegroundColor Cyan
Write-Host "2. EC2 Instances: https://console.aws.amazon.com/ec2/v2/home#Instances:" -ForegroundColor Cyan
Write-Host "3. Load Balancers: https://console.aws.amazon.com/ec2/v2/home#LoadBalancers:" -ForegroundColor Cyan
Write-Host "4. S3 Buckets: https://console.aws.amazon.com/s3/" -ForegroundColor Cyan
Write-Host "5. DynamoDB: https://console.aws.amazon.com/dynamodb/" -ForegroundColor Cyan
Write-Host "6. Lambda: https://console.aws.amazon.com/lambda/" -ForegroundColor Cyan
Write-Host "7. API Gateway: https://console.aws.amazon.com/apigateway/" -ForegroundColor Cyan
Write-Host "8. Amplify: https://console.aws.amazon.com/amplify/" -ForegroundColor Cyan
Write-Host "9. Billing: https://console.aws.amazon.com/billing/" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 DELETE EVERYTHING you see in these consoles!" -ForegroundColor Red
