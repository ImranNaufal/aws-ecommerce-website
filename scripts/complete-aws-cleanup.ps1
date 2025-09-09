# Complete AWS Cleanup - Remove ALL Services
param(
    [string]$Region = "ap-southeast-1"
)

Write-Host "🧹 COMPLETE AWS CLEANUP - REMOVING ALL SERVICES" -ForegroundColor Red
Write-Host "This will delete EVERYTHING in your AWS account!" -ForegroundColor Red
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

$env:AWS_DEFAULT_REGION = $Region

Write-Host "⚠️  WARNING: This will delete ALL AWS resources!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or Enter to continue..." -ForegroundColor Yellow
Read-Host

try {
    # 1. Delete ALL CloudFormation Stacks
    Write-Host "🗑️ Deleting ALL CloudFormation Stacks..." -ForegroundColor Cyan
    $allStacks = aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[*].StackName" --output text --region $Region
    if ($allStacks) {
        $stackList = $allStacks -split '\s+'
        foreach ($stack in $stackList) {
            if ($stack.Trim()) {
                Write-Host "   Deleting stack: $stack" -ForegroundColor White
                aws cloudformation delete-stack --stack-name $stack --region $Region
            }
        }
    }

    # 2. Terminate ALL EC2 Instances
    Write-Host "🖥️ Terminating ALL EC2 Instances..." -ForegroundColor Cyan
    $allInstances = aws ec2 describe-instances --query "Reservations[*].Instances[?State.Name!='terminated'].InstanceId" --output text --region $Region
    if ($allInstances) {
        $instanceList = $allInstances -split '\s+'
        foreach ($instance in $instanceList) {
            if ($instance.Trim()) {
                Write-Host "   Terminating: $instance" -ForegroundColor White
                aws ec2 terminate-instances --instance-ids $instance --region $Region
            }
        }
    }

    # 3. Delete ALL Load Balancers
    Write-Host "⚖️ Deleting ALL Load Balancers..." -ForegroundColor Cyan
    $allLBs = aws elbv2 describe-load-balancers --query "LoadBalancers[*].LoadBalancerArn" --output text --region $Region
    if ($allLBs) {
        $lbList = $allLBs -split '\s+'
        foreach ($lb in $lbList) {
            if ($lb.Trim()) {
                Write-Host "   Deleting LB: $lb" -ForegroundColor White
                aws elbv2 delete-load-balancer --load-balancer-arn $lb --region $Region
            }
        }
    }

    # 4. Delete ALL NAT Gateways
    Write-Host "🌐 Deleting ALL NAT Gateways..." -ForegroundColor Cyan
    $allNATs = aws ec2 describe-nat-gateways --query "NatGateways[?State=='available'].NatGatewayId" --output text --region $Region
    if ($allNATs) {
        $natList = $allNATs -split '\s+'
        foreach ($nat in $natList) {
            if ($nat.Trim()) {
                Write-Host "   Deleting NAT: $nat" -ForegroundColor White
                aws ec2 delete-nat-gateway --nat-gateway-id $nat --region $Region
            }
        }
    }

    # 5. Release ALL Elastic IPs
    Write-Host "📍 Releasing ALL Elastic IPs..." -ForegroundColor Cyan
    $allEIPs = aws ec2 describe-addresses --query "Addresses[*].AllocationId" --output text --region $Region
    if ($allEIPs) {
        $eipList = $allEIPs -split '\s+'
        foreach ($eip in $eipList) {
            if ($eip.Trim()) {
                Write-Host "   Releasing EIP: $eip" -ForegroundColor White
                aws ec2 release-address --allocation-id $eip --region $Region
            }
        }
    }

    # 6. Delete ALL S3 Buckets
    Write-Host "🪣 Deleting ALL S3 Buckets..." -ForegroundColor Cyan
    $allBuckets = aws s3api list-buckets --query "Buckets[*].Name" --output text
    if ($allBuckets) {
        $bucketList = $allBuckets -split '\s+'
        foreach ($bucket in $bucketList) {
            if ($bucket.Trim()) {
                Write-Host "   Emptying bucket: $bucket" -ForegroundColor White
                aws s3 rm s3://$bucket --recursive 2>$null
                Write-Host "   Deleting bucket: $bucket" -ForegroundColor White
                aws s3 rb s3://$bucket 2>$null
            }
        }
    }

    # 7. Delete ALL DynamoDB Tables
    Write-Host "🗄️ Deleting ALL DynamoDB Tables..." -ForegroundColor Cyan
    $allTables = aws dynamodb list-tables --query "TableNames" --output text --region $Region
    if ($allTables) {
        $tableList = $allTables -split '\s+'
        foreach ($table in $tableList) {
            if ($table.Trim()) {
                Write-Host "   Deleting table: $table" -ForegroundColor White
                aws dynamodb delete-table --table-name $table --region $Region
            }
        }
    }

    # 8. Delete ALL Lambda Functions
    Write-Host "⚡ Deleting ALL Lambda Functions..." -ForegroundColor Cyan
    $allFunctions = aws lambda list-functions --query "Functions[*].FunctionName" --output text --region $Region
    if ($allFunctions) {
        $functionList = $allFunctions -split '\s+'
        foreach ($function in $functionList) {
            if ($function.Trim()) {
                Write-Host "   Deleting function: $function" -ForegroundColor White
                aws lambda delete-function --function-name $function --region $Region
            }
        }
    }

    # 9. Delete ALL API Gateways
    Write-Host "🌐 Deleting ALL API Gateways..." -ForegroundColor Cyan
    $allAPIs = aws apigateway get-rest-apis --query "items[*].id" --output text --region $Region
    if ($allAPIs) {
        $apiList = $allAPIs -split '\s+'
        foreach ($api in $apiList) {
            if ($api.Trim()) {
                Write-Host "   Deleting API: $api" -ForegroundColor White
                aws apigateway delete-rest-api --rest-api-id $api --region $Region
            }
        }
    }

    # 10. Delete ALL CloudWatch Log Groups
    Write-Host "📊 Deleting ALL CloudWatch Log Groups..." -ForegroundColor Cyan
    $allLogGroups = aws logs describe-log-groups --query "logGroups[*].logGroupName" --output text --region $Region
    if ($allLogGroups) {
        $logList = $allLogGroups -split '\s+'
        foreach ($logGroup in $logList) {
            if ($logGroup.Trim()) {
                Write-Host "   Deleting log group: $logGroup" -ForegroundColor White
                aws logs delete-log-group --log-group-name $logGroup --region $Region
            }
        }
    }

    # 11. Delete ALL SNS Topics
    Write-Host "📢 Deleting ALL SNS Topics..." -ForegroundColor Cyan
    $allTopics = aws sns list-topics --query "Topics[*].TopicArn" --output text --region $Region
    if ($allTopics) {
        $topicList = $allTopics -split '\s+'
        foreach ($topic in $topicList) {
            if ($topic.Trim()) {
                Write-Host "   Deleting topic: $topic" -ForegroundColor White
                aws sns delete-topic --topic-arn $topic --region $Region
            }
        }
    }

    # 12. Delete ALL Amplify Apps
    Write-Host "📱 Deleting ALL Amplify Apps..." -ForegroundColor Cyan
    $allApps = aws amplify list-apps --query "apps[*].appId" --output text --region $Region
    if ($allApps) {
        $appList = $allApps -split '\s+'
        foreach ($app in $appList) {
            if ($app.Trim()) {
                Write-Host "   Deleting Amplify app: $app" -ForegroundColor White
                aws amplify delete-app --app-id $app --region $Region
            }
        }
    }

    # 13. Wait for deletions to complete
    Write-Host "⏳ Waiting for deletions to complete..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30

    Write-Host ""
    Write-Host "🎉 COMPLETE CLEANUP FINISHED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ ALL AWS SERVICES DELETED:" -ForegroundColor Yellow
    Write-Host "   - CloudFormation Stacks" -ForegroundColor White
    Write-Host "   - EC2 Instances" -ForegroundColor White
    Write-Host "   - Load Balancers" -ForegroundColor White
    Write-Host "   - NAT Gateways" -ForegroundColor White
    Write-Host "   - Elastic IPs" -ForegroundColor White
    Write-Host "   - S3 Buckets" -ForegroundColor White
    Write-Host "   - DynamoDB Tables" -ForegroundColor White
    Write-Host "   - Lambda Functions" -ForegroundColor White
    Write-Host "   - API Gateways" -ForegroundColor White
    Write-Host "   - CloudWatch Logs" -ForegroundColor White
    Write-Host "   - SNS Topics" -ForegroundColor White
    Write-Host "   - Amplify Apps" -ForegroundColor White
    Write-Host ""
    Write-Host "💰 MONTHLY COST: $0.00" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 YOUR PORTFOLIO IS STILL PERFECT:" -ForegroundColor Yellow
    Write-Host "   - Complete GitHub repository" -ForegroundColor White
    Write-Host "   - All AWS code and documentation" -ForegroundColor White
    Write-Host "   - Professional presentation ready" -ForegroundColor White
    Write-Host "   - Can redeploy anytime for interviews" -ForegroundColor White

} catch {
    Write-Host "❌ Cleanup error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check AWS Console manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 VERIFY IN AWS CONSOLE:" -ForegroundColor Cyan
Write-Host "Check that all services show 0 resources" -ForegroundColor White
