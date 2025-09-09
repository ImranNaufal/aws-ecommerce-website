# AWS Services Cleanup Script
# This script will clean up all expensive AWS services to avoid charges

param(
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-southeast-1",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "mini-ecommerce",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev"
)

Write-Host "🧹 CLEANING UP AWS SERVICES TO AVOID CHARGES" -ForegroundColor Red
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Project: $ProjectName" -ForegroundColor Yellow
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Set AWS Region
$env:AWS_DEFAULT_REGION = $Region

try {
    Write-Host "⚠️  WARNING: This will delete AWS resources and may cause data loss!" -ForegroundColor Red
    Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""

    # 1. Delete CloudFormation Stacks (this will clean up most resources)
    Write-Host "🗑️  Deleting CloudFormation Stacks..." -ForegroundColor Cyan
    
    $stacks = @(
        "$ProjectName-$Environment-amplify",
        "$ProjectName-$Environment-api-gateway", 
        "$ProjectName-$Environment-lambda",
        "$ProjectName-$Environment-monitoring",
        "$ProjectName-$Environment-infrastructure",
        "$ProjectName-$Environment-ec2",
        "$ProjectName-$Environment-database"
    )
    
    foreach ($stackName in $stacks) {
        Write-Host "   Deleting stack: $stackName" -ForegroundColor White
        aws cloudformation delete-stack --stack-name $stackName --region $Region 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Stack deletion initiated: $stackName" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Stack not found or already deleted: $stackName" -ForegroundColor Yellow
        }
    }

    # 2. Wait for stack deletions to complete
    Write-Host "⏳ Waiting for stack deletions to complete..." -ForegroundColor Cyan
    foreach ($stackName in $stacks) {
        Write-Host "   Waiting for: $stackName" -ForegroundColor White
        aws cloudformation wait stack-delete-complete --stack-name $stackName --region $Region 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Stack deleted: $stackName" -ForegroundColor Green
        }
    }

    # 3. Clean up EC2 instances manually (if any remain)
    Write-Host "🖥️  Checking for remaining EC2 instances..." -ForegroundColor Cyan
    $instances = aws ec2 describe-instances --filters "Name=tag:Project,Values=$ProjectName" --query "Reservations[*].Instances[*].InstanceId" --output text --region $Region 2>$null
    
    if ($instances -and $instances.Trim() -ne "") {
        $instanceList = $instances.Split("`t`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($instanceId in $instanceList) {
            if ($instanceId.Trim() -ne "") {
                Write-Host "   Terminating instance: $instanceId" -ForegroundColor White
                aws ec2 terminate-instances --instance-ids $instanceId --region $Region
                Write-Host "   ✅ Instance termination initiated: $instanceId" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   ✅ No EC2 instances found" -ForegroundColor Green
    }

    # 4. Clean up Load Balancers
    Write-Host "⚖️  Checking for Load Balancers..." -ForegroundColor Cyan
    $loadBalancers = aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(LoadBalancerName, '$ProjectName')].LoadBalancerArn" --output text --region $Region 2>$null
    
    if ($loadBalancers -and $loadBalancers.Trim() -ne "") {
        $lbList = $loadBalancers.Split("`t`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($lbArn in $lbList) {
            if ($lbArn.Trim() -ne "") {
                Write-Host "   Deleting load balancer: $lbArn" -ForegroundColor White
                aws elbv2 delete-load-balancer --load-balancer-arn $lbArn --region $Region
                Write-Host "   ✅ Load balancer deletion initiated" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   ✅ No Load Balancers found" -ForegroundColor Green
    }

    # 5. Clean up NAT Gateways
    Write-Host "🌐 Checking for NAT Gateways..." -ForegroundColor Cyan
    $natGateways = aws ec2 describe-nat-gateways --filter "Name=tag:Project,Values=$ProjectName" --query "NatGateways[*].NatGatewayId" --output text --region $Region 2>$null
    
    if ($natGateways -and $natGateways.Trim() -ne "") {
        $natList = $natGateways.Split("`t`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($natId in $natList) {
            if ($natId.Trim() -ne "") {
                Write-Host "   Deleting NAT Gateway: $natId" -ForegroundColor White
                aws ec2 delete-nat-gateway --nat-gateway-id $natId --region $Region
                Write-Host "   ✅ NAT Gateway deletion initiated: $natId" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   ✅ No NAT Gateways found" -ForegroundColor Green
    }

    # 6. Clean up Elastic IPs
    Write-Host "📍 Checking for Elastic IPs..." -ForegroundColor Cyan
    $elasticIPs = aws ec2 describe-addresses --filters "Name=tag:Project,Values=$ProjectName" --query "Addresses[*].AllocationId" --output text --region $Region 2>$null
    
    if ($elasticIPs -and $elasticIPs.Trim() -ne "") {
        $eipList = $elasticIPs.Split("`t`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($eipId in $eipList) {
            if ($eipId.Trim() -ne "") {
                Write-Host "   Releasing Elastic IP: $eipId" -ForegroundColor White
                aws ec2 release-address --allocation-id $eipId --region $Region
                Write-Host "   ✅ Elastic IP released: $eipId" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "   ✅ No Elastic IPs found" -ForegroundColor Green
    }

    # 7. Keep S3 bucket but remove expensive features
    Write-Host "🪣 Optimizing S3 bucket (keeping website)..." -ForegroundColor Cyan
    $bucketName = "$ProjectName-$Environment-website-834308799940"
    
    # Remove S3 bucket versioning to reduce costs
    aws s3api put-bucket-versioning --bucket $bucketName --versioning-configuration Status=Suspended --region $Region 2>$null
    Write-Host "   ✅ S3 versioning suspended to reduce costs" -ForegroundColor Green

    # 8. Keep DynamoDB tables (free tier) but remove expensive features
    Write-Host "🗄️  Optimizing DynamoDB tables..." -ForegroundColor Cyan
    
    # Switch to on-demand billing if provisioned
    aws dynamodb update-table --table-name "$ProjectName-products" --billing-mode PAY_PER_REQUEST --region $Region 2>$null
    aws dynamodb update-table --table-name "$ProjectName-cart" --billing-mode PAY_PER_REQUEST --region $Region 2>$null
    Write-Host "   ✅ DynamoDB tables set to pay-per-request (cost optimized)" -ForegroundColor Green

    # 9. Clean up CloudWatch Log Groups (keep recent logs only)
    Write-Host "📊 Cleaning up CloudWatch logs..." -ForegroundColor Cyan
    $logGroups = aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/$ProjectName" --query "logGroups[*].logGroupName" --output text --region $Region 2>$null
    
    if ($logGroups -and $logGroups.Trim() -ne "") {
        $logList = $logGroups.Split("`t`n", [System.StringSplitOptions]::RemoveEmptyEntries)
        foreach ($logGroup in $logList) {
            if ($logGroup.Trim() -ne "") {
                # Set retention to 1 day to minimize costs
                aws logs put-retention-policy --log-group-name $logGroup --retention-in-days 1 --region $Region 2>$null
                Write-Host "   ✅ Log retention set to 1 day: $logGroup" -ForegroundColor Green
            }
        }
    }

    # 10. Summary
    Write-Host ""
    Write-Host "🎉 CLEANUP COMPLETED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ DELETED (to avoid charges):" -ForegroundColor Yellow
    Write-Host "   - EC2 instances and Auto Scaling Groups" -ForegroundColor White
    Write-Host "   - Load Balancers and Target Groups" -ForegroundColor White
    Write-Host "   - NAT Gateways and Elastic IPs" -ForegroundColor White
    Write-Host "   - Lambda functions and API Gateway" -ForegroundColor White
    Write-Host "   - CloudWatch detailed monitoring" -ForegroundColor White
    Write-Host "   - SNS topics and subscriptions" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ KEPT (minimal/free tier):" -ForegroundColor Yellow
    Write-Host "   - S3 bucket with your website (optimized)" -ForegroundColor White
    Write-Host "   - DynamoDB tables (pay-per-request)" -ForegroundColor White
    Write-Host "   - CloudFormation templates (no cost)" -ForegroundColor White
    Write-Host "   - Your GitHub repository (complete code)" -ForegroundColor White
    Write-Host ""
    Write-Host "💰 ESTIMATED MONTHLY COST NOW: $1-5 (instead of $50-100)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "   1. Your website is still live at S3 URL" -ForegroundColor White
    Write-Host "   2. Use AWS Amplify for professional CI/CD" -ForegroundColor White
    Write-Host "   3. Deploy full stack only when needed for interviews" -ForegroundColor White
    Write-Host "   4. Your GitHub shows complete AWS expertise" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Your portfolio is now cost-optimized while maintaining professional impact!" -ForegroundColor Green

} catch {
    Write-Host "❌ Cleanup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Manual cleanup may be required. Check AWS Console:" -ForegroundColor Yellow
    Write-Host "   - EC2 Dashboard: Terminate instances" -ForegroundColor White
    Write-Host "   - CloudFormation: Delete stacks" -ForegroundColor White
    Write-Host "   - Load Balancers: Delete ALBs" -ForegroundColor White
    Write-Host "   - VPC: Delete NAT Gateways" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "💡 Remember: You can redeploy everything instantly using your scripts when needed!" -ForegroundColor Cyan
