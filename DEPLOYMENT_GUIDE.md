# 🚀 AWS E-commerce Infrastructure Deployment Guide

This guide provides step-by-step instructions for deploying the complete AWS e-commerce infrastructure.

## 📋 **Prerequisites**

### **Required Tools**
- **AWS CLI** configured with appropriate permissions
- **PowerShell** (Windows) or **Bash** (Linux/Mac)
- **Node.js 18+** for local development
- **Git** for version control

### **AWS Permissions Required**
- CloudFormation (full access)
- EC2 (full access)
- S3 (full access)
- DynamoDB (full access)
- IAM (create roles and policies)
- VPC (full access)

### **AWS CLI Configuration**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: ap-southeast-1
# Default output format: json
```

---

## 🏗️ **Infrastructure Components**

### **Stack 1: Main Infrastructure**
- **VPC** with public/private subnets
- **S3 buckets** for website and images
- **Security Groups** for network access
- **Internet Gateway** and routing

### **Stack 2: Database**
- **DynamoDB tables**: Products, Users, Orders, Cart
- **Global Secondary Indexes** for efficient queries
- **Proper table configuration** for scalability

### **Stack 3: EC2 Backend**
- **EC2 instance** (t3.micro) for backend API
- **IAM roles** with DynamoDB and S3 permissions
- **Automated server setup** with Node.js and PM2

---

## 🚀 **Quick Deployment (Recommended)**

### **One-Command Deployment**
```powershell
.\scripts\deploy-windows.ps1 -ProjectName "mini-ecommerce" -Environment "dev" -AwsRegion "ap-southeast-1"
```

**What this does:**
1. Deploys main infrastructure stack
2. Creates DynamoDB database tables
3. Launches EC2 backend server
4. Builds and deploys React frontend
5. Configures all networking and security

**Deployment time:** ~10-15 minutes

---

## 🔧 **Manual Deployment Steps**

### **Step 1: Deploy Main Infrastructure**
```powershell
aws cloudformation deploy \
  --template-file infrastructure/main-stack.yml \
  --stack-name "mini-ecommerce-dev-infrastructure" \
  --parameter-overrides \
    ProjectName=mini-ecommerce \
    Environment=dev \
    KeyPairName=mini-ecommerce-keypair \
  --capabilities CAPABILITY_IAM \
  --region ap-southeast-1
```

### **Step 2: Deploy Database**
```powershell
aws cloudformation deploy \
  --template-file infrastructure/database-simple.yml \
  --stack-name "mini-ecommerce-dev-database" \
  --parameter-overrides \
    ProjectName=mini-ecommerce \
    Environment=dev \
  --region ap-southeast-1
```

### **Step 3: Deploy EC2 Backend**
```powershell
aws cloudformation deploy \
  --template-file infrastructure/ec2-stack.yml \
  --stack-name "mini-ecommerce-dev-ec2" \
  --parameter-overrides \
    ProjectName=mini-ecommerce \
    Environment=dev \
    KeyPairName=mini-ecommerce-keypair \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-southeast-1
```

### **Step 4: Build and Deploy Frontend**
```powershell
# Build React application
cd frontend
npm install
npm run build

# Deploy to S3
aws s3 sync build/ s3://mini-ecommerce-dev-website-834308799940 --delete --region ap-southeast-1
```

---

## 🧪 **Testing Deployment**

### **Verify Infrastructure**
```powershell
# Check CloudFormation stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --region ap-southeast-1

# Check EC2 instance
aws ec2 describe-instances --filters "Name=tag:Project,Values=mini-ecommerce" --region ap-southeast-1

# Check DynamoDB tables
aws dynamodb list-tables --region ap-southeast-1
```

### **Test Website**
1. Get S3 website URL from CloudFormation outputs
2. Visit the website in browser
3. Test navigation and shopping cart functionality
4. Verify API connectivity

---

## 🧹 **Cleanup Resources**

### **Quick Cleanup**
```powershell
.\scripts\quick-cleanup.ps1
```

### **Complete Cleanup**
```powershell
.\scripts\cleanup-aws-services.ps1
```

### **Manual Cleanup**
```powershell
# Delete CloudFormation stacks (in reverse order)
aws cloudformation delete-stack --stack-name "mini-ecommerce-dev-ec2" --region ap-southeast-1
aws cloudformation delete-stack --stack-name "mini-ecommerce-dev-database" --region ap-southeast-1
aws cloudformation delete-stack --stack-name "mini-ecommerce-dev-infrastructure" --region ap-southeast-1
```

---

## 💰 **Cost Estimation**

### **Monthly Costs (ap-southeast-1)**
- **EC2 t3.micro**: ~$8.50/month
- **S3 Storage**: ~$1-2/month
- **DynamoDB**: $0/month (free tier)
- **Data Transfer**: ~$1/month
- **Total**: ~$10-12/month

### **Cost Optimization**
- Use **t3.micro** for free tier eligibility
- Enable **S3 lifecycle policies** for old objects
- Monitor **DynamoDB** usage to stay in free tier
- Set up **billing alerts** for cost monitoring

---

## 🔧 **Troubleshooting**

### **Common Issues**

**CloudFormation Stack Fails:**
- Check IAM permissions
- Verify region availability
- Check resource limits

**EC2 Instance Not Accessible:**
- Verify Security Group rules
- Check VPC and subnet configuration
- Ensure Internet Gateway is attached

**Frontend Not Loading:**
- Check S3 bucket policy
- Verify static website hosting is enabled
- Check build files are uploaded correctly

**API Not Working:**
- Check EC2 instance status
- Verify backend server is running
- Check Security Group allows port 3001

### **Getting Help**
- Check CloudFormation events for detailed error messages
- Use AWS CloudWatch logs for application debugging
- Verify all prerequisites are met

---

## 📚 **Additional Resources**

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Node.js on AWS](https://docs.aws.amazon.com/sdk-for-javascript/)

---

**🎯 This deployment creates a production-ready e-commerce infrastructure suitable for portfolio demonstration and enterprise development!**
