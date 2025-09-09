# 🏗️ AWS E-commerce Infrastructure Architecture

This document outlines the complete architecture design, technical decisions, and implementation details of the AWS e-commerce platform.

## 🎯 **Architecture Overview**

### **Design Principles**
- **Scalability**: Designed to handle growth from startup to enterprise scale
- **Security**: Multi-layer security with VPC isolation and IAM best practices
- **Cost Efficiency**: Optimized resource usage with cleanup automation
- **Maintainability**: Infrastructure as Code for reproducible deployments
- **High Availability**: Multi-AZ ready architecture

### **Architecture Pattern**
**Three-Tier Architecture** with clear separation of concerns:
- **Presentation Layer**: React SPA hosted on S3
- **Application Layer**: Node.js API server on EC2
- **Data Layer**: DynamoDB NoSQL database

---

## 🌐 **Network Architecture**

### **VPC Design**
```
VPC (10.0.0.0/16)
├── Public Subnet (10.0.1.0/24)
│   ├── EC2 Backend Server
│   ├── Internet Gateway Access
│   └── NAT Gateway (for future private resources)
├── Private Subnet (10.0.2.0/24)
│   ├── Reserved for RDS/ElastiCache
│   └── Internal services
└── Security Groups
    ├── EC2-SG (SSH, HTTP, API ports)
    └── Database-SG (Internal access only)
```

### **Security Groups**
- **EC2 Security Group**: Allows SSH (22), HTTP (80), HTTPS (443), API (3001)
- **Database Security Group**: Internal VPC access only
- **Principle of Least Privilege**: Minimal required access

---

## 💾 **Data Architecture**

### **DynamoDB Table Design**

#### **Products Table**
```json
{
  "TableName": "mini-ecommerce-dev-products",
  "KeySchema": [
    {"AttributeName": "productId", "KeyType": "HASH"}
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "CategoryIndex",
      "KeySchema": [
        {"AttributeName": "category", "KeyType": "HASH"}
      ]
    }
  ]
}
```

#### **Users Table**
```json
{
  "TableName": "mini-ecommerce-dev-users",
  "KeySchema": [
    {"AttributeName": "userId", "KeyType": "HASH"}
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "EmailIndex",
      "KeySchema": [
        {"AttributeName": "email", "KeyType": "HASH"}
      ]
    }
  ]
}
```

#### **Orders Table**
```json
{
  "TableName": "mini-ecommerce-dev-orders",
  "KeySchema": [
    {"AttributeName": "orderId", "KeyType": "HASH"}
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "UserOrdersIndex",
      "KeySchema": [
        {"AttributeName": "userId", "KeyType": "HASH"},
        {"AttributeName": "createdAt", "KeyType": "RANGE"}
      ]
    }
  ]
}
```

#### **Cart Table**
```json
{
  "TableName": "mini-ecommerce-dev-cart",
  "KeySchema": [
    {"AttributeName": "userId", "KeyType": "HASH"},
    {"AttributeName": "productId", "KeyType": "RANGE"}
  ]
}
```

---

## 🖥️ **Compute Architecture**

### **EC2 Instance Configuration**
- **Instance Type**: t3.micro (1 vCPU, 1GB RAM)
- **AMI**: Amazon Linux 2023
- **Storage**: 8GB GP3 EBS volume
- **Networking**: Public IP with Elastic IP option

### **Backend Server Stack**
```bash
# Installed Software
├── Node.js 18.x (Latest LTS)
├── PM2 (Process Manager)
├── Express.js (Web Framework)
├── AWS SDK (Cloud Integration)
└── CloudWatch Agent (Monitoring)
```

### **Auto-Scaling Ready**
The architecture supports future auto-scaling implementation:
- Application Load Balancer ready
- Stateless application design
- External session storage (DynamoDB)
- Health check endpoints implemented

---

## 📦 **Storage Architecture**

### **S3 Bucket Strategy**

#### **Website Bucket**
- **Purpose**: Static website hosting
- **Configuration**: Public read access, website hosting enabled
- **Content**: React build files, assets, images
- **CDN Ready**: CloudFront distribution ready

#### **Images Bucket**
- **Purpose**: Product images and user uploads
- **Configuration**: Public read access with CORS
- **Optimization**: Lifecycle policies for cost management
- **Security**: Signed URLs for sensitive content

### **Storage Optimization**
- **Compression**: Gzip enabled for text files
- **Caching**: Browser caching headers configured
- **Lifecycle**: Automatic transition to IA/Glacier for old files

---

## 🔐 **Security Architecture**

### **Identity and Access Management**
```yaml
EC2Role:
  Policies:
    - DynamoDBAccess: Read/Write to application tables
    - S3Access: Read/Write to application buckets
    - CloudWatchAccess: Metrics and logging
  Principle: Least privilege access
```

### **Network Security**
- **VPC Isolation**: Private network with controlled access
- **Security Groups**: Stateful firewall rules
- **NACLs**: Additional subnet-level protection
- **Private Subnets**: Sensitive resources isolated

### **Data Security**
- **Encryption at Rest**: DynamoDB and S3 encryption enabled
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Access Logging**: CloudTrail and VPC Flow Logs
- **Secrets Management**: AWS Systems Manager Parameter Store

---

## 📊 **Monitoring Architecture**

### **CloudWatch Integration**
- **EC2 Metrics**: CPU, Memory, Network, Disk
- **DynamoDB Metrics**: Read/Write capacity, throttling
- **S3 Metrics**: Request metrics, error rates
- **Custom Metrics**: Application-specific monitoring

### **Alerting Strategy**
- **SNS Topics**: Email and SMS notifications
- **CloudWatch Alarms**: Threshold-based alerting
- **Health Checks**: Application and infrastructure monitoring
- **Log Aggregation**: Centralized logging with CloudWatch Logs

---

## 🚀 **Deployment Architecture**

### **Infrastructure as Code**
```
infrastructure/
├── main-stack.yml          # VPC, S3, Security Groups
├── database-simple.yml     # DynamoDB tables
├── ec2-stack.yml          # EC2 instance and IAM
└── monitoring-stack.yml    # CloudWatch resources
```

### **Deployment Pipeline**
1. **Infrastructure**: CloudFormation stack deployment
2. **Application**: Code deployment to EC2
3. **Frontend**: Build and deploy to S3
4. **Testing**: Automated health checks
5. **Monitoring**: CloudWatch dashboard activation

### **Environment Management**
- **Parameter-driven**: Environment-specific configurations
- **Stack Naming**: Consistent naming conventions
- **Resource Tagging**: Comprehensive tagging strategy
- **Cost Allocation**: Environment-based cost tracking

---

## 📈 **Scalability Considerations**

### **Horizontal Scaling**
- **Auto Scaling Groups**: EC2 instance scaling
- **Application Load Balancer**: Traffic distribution
- **Database Scaling**: DynamoDB auto-scaling
- **CDN**: CloudFront for global distribution

### **Performance Optimization**
- **Caching Strategy**: Redis/ElastiCache ready
- **Database Optimization**: Proper indexing and query patterns
- **Asset Optimization**: Minification and compression
- **API Optimization**: Response caching and pagination

---

## 🎯 **Future Enhancements**

### **Phase 2 Features**
- **Container Deployment**: ECS/EKS migration path
- **Serverless Options**: Lambda function integration
- **Advanced Monitoring**: X-Ray tracing, detailed metrics
- **CI/CD Pipeline**: GitHub Actions or CodePipeline

### **Enterprise Features**
- **Multi-Region**: Cross-region replication
- **Disaster Recovery**: Automated backup and restore
- **Advanced Security**: WAF, Shield, GuardDuty
- **Compliance**: SOC2, PCI DSS ready architecture

---

**🏆 This architecture demonstrates enterprise-level design skills and AWS best practices suitable for production environments.**
