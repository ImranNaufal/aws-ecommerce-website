# 🛍️ AWS E-commerce Infrastructure

**Enterprise-grade e-commerce platform with complete AWS cloud infrastructure, built using Infrastructure as Code principles.**

[![AWS](https://img.shields.io/badge/AWS-Cloud%20Infrastructure-orange?style=for-the-badge)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![CloudFormation](https://img.shields.io/badge/CloudFormation-Infrastructure%20as%20Code-FF9900?style=for-the-badge)](https://aws.amazon.com/cloudformation/)

---

## 📸 **Project Screenshots**

> **Note**: Screenshots demonstrate the complete functionality of the deployed e-commerce platform

*Screenshots showcase: Homepage, Product Catalog, Shopping Cart, Checkout Process, and AWS Infrastructure*

---

## 📋 **Project Overview**

This project demonstrates **enterprise-level AWS infrastructure** for a complete e-commerce platform. Built using Infrastructure as Code principles, it showcases professional cloud architecture, automated deployment, and scalable design patterns.

### **🎯 Key Technical Achievements**
- ✅ **Complete AWS Infrastructure** deployed via CloudFormation
- ✅ **Multi-tier Architecture** (Frontend, Backend, Database)
- ✅ **Infrastructure as Code** with automated deployment scripts
- ✅ **Production-ready Security** with VPC, IAM roles, and Security Groups
- ✅ **Scalable Design** with EC2, S3, DynamoDB integration
- ✅ **Professional DevOps** practices with CI/CD ready templates

---

## 🛠️ **Technologies Used**

### **AWS Cloud Infrastructure**
- **Amazon EC2** - Backend server hosting
- **Amazon S3** - Static website hosting and file storage
- **Amazon DynamoDB** - NoSQL database for scalable data storage
- **Amazon VPC** - Secure network infrastructure
- **AWS IAM** - Identity and access management
- **AWS CloudFormation** - Infrastructure as Code templates

### **Frontend Technologies**
- **React 18** with TypeScript for type safety
- **CSS3** with responsive design principles
- **React Router** for client-side navigation
- **Context API** for state management

### **Backend Technologies**
- **Node.js** with Express.js framework
- **AWS SDK** for seamless cloud integration
- **RESTful API** architecture
- **PM2** for production process management

### **DevOps & Deployment**
- **Infrastructure as Code** with CloudFormation templates
- **Automated Deployment** scripts for Windows/PowerShell
- **Version Control** with Git integration
- **Environment Management** (dev/staging/prod configurations)

---

## ✨ **Key Features**

### **🏗️ AWS Infrastructure**
- **Multi-tier Architecture**: Separated frontend, backend, and database layers
- **Scalable Design**: Auto-scaling ready with load balancer support
- **Security Best Practices**: VPC isolation, IAM roles, Security Groups
- **Cost Optimization**: Efficient resource allocation and monitoring
- **High Availability**: Multi-AZ deployment ready

### **🛍️ E-commerce Application**
- **Product Management**: Dynamic product catalog with categories
- **Shopping Cart**: Full cart functionality with persistent state
- **User Interface**: Professional, responsive design
- **API Integration**: RESTful services with error handling
- **State Management**: React Context for application state

---

## 🏗️ **AWS Architecture Diagram**

```
                    ┌─────────────────────────────────────┐
                    │           AWS Cloud                 │
                    │                                     │
    ┌─────────────────────────────────────────────────────────────┐
    │                    VPC (10.0.0.0/16)                       │
    │                                                             │
    │  ┌─────────────────┐    ┌─────────────────┐                │
    │  │  Public Subnet  │    │ Private Subnet  │                │
    │  │                 │    │                 │                │
    │  │  ┌───────────┐  │    │  ┌───────────┐  │                │
    │  │  │    EC2    │  │    │  │ DynamoDB  │  │                │
    │  │  │ Backend   │◄─┼────┼─►│ Database  │  │                │
    │  │  │ Server    │  │    │  │           │  │                │
    │  │  └───────────┘  │    │  └───────────┘  │                │
    │  └─────────────────┘    └─────────────────┘                │
    └─────────────────────────────────────────────────────────────┘
                    │
    ┌─────────────────────────────────────────────────────────────┐
    │                    S3 Bucket                                │
    │              Static Website Hosting                         │
    │                 React Frontend                              │
    └─────────────────────────────────────────────────────────────┘
```

### **AWS Services Deployed**
- **Amazon VPC**: Secure network infrastructure with public/private subnets
- **Amazon EC2**: Backend API server (t3.micro instance)
- **Amazon S3**: Static website hosting for React frontend
- **Amazon DynamoDB**: NoSQL database (4 tables: Products, Users, Orders, Cart)
- **AWS CloudFormation**: Infrastructure as Code (3 stacks)
- **AWS IAM**: Security roles and policies
- **Security Groups**: Network access control

---

## 📁 **Project Structure**

```
aws-ecommerce-website/
├── 📁 frontend/                 # React TypeScript Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Page components (Home, Products, Cart, Checkout)
│   │   ├── 📁 context/         # React Context for state management
│   │   └── 📄 App.tsx          # Main application component
│   ├── 📄 package.json         # Frontend dependencies
│   └── 📁 build/               # Production build files
├── 📁 backend/                  # Node.js Express Backend
│   ├── 📁 routes/              # API endpoints (products, cart, orders)
│   ├── 📄 server.js            # Express server configuration
│   └── 📄 package.json         # Backend dependencies
├── 📁 infrastructure/           # AWS CloudFormation Templates
│   ├── 📄 main-stack.yml       # VPC, S3, Security Groups
│   ├── 📄 ec2-stack.yml        # EC2 instance and IAM roles
│   ├── 📄 database-simple.yml  # DynamoDB tables
│   └── 📄 monitoring-stack.yml # CloudWatch monitoring
├── 📁 scripts/                 # Deployment automation scripts
│   ├── 📄 deploy-windows.ps1   # Complete deployment script
│   ├── 📄 cleanup-aws-services.ps1 # Resource cleanup
│   └── 📄 quick-cleanup.ps1    # Fast cleanup script
├── 📄 README.md                # Project documentation
└── 📄 PROJECT_STRUCTURE.md     # Detailed project structure
```

---

## 🚀 **Deployment Guide**

### **Prerequisites**
- AWS CLI configured with appropriate permissions
- PowerShell (for Windows deployment scripts)
- Node.js 18+ (for local development)

### **Quick Deployment**
```powershell
# Deploy complete infrastructure
.\scripts\deploy-windows.ps1 -ProjectName "your-project" -Environment "dev" -AwsRegion "ap-southeast-1"
```

### **Manual Deployment Steps**
```powershell
# 1. Deploy main infrastructure (VPC, S3, Security Groups)
aws cloudformation deploy --template-file infrastructure/main-stack.yml --stack-name "project-dev-infrastructure" --capabilities CAPABILITY_IAM

# 2. Deploy database (DynamoDB tables)
aws cloudformation deploy --template-file infrastructure/database-simple.yml --stack-name "project-dev-database"

# 3. Deploy EC2 backend server
aws cloudformation deploy --template-file infrastructure/ec2-stack.yml --stack-name "project-dev-ec2" --capabilities CAPABILITY_NAMED_IAM

# 4. Build and deploy frontend
cd frontend && npm run build
aws s3 sync build/ s3://your-website-bucket --delete
```

### **Local Development**
```bash
# Frontend development
cd frontend && npm install && npm start

# Backend development
cd backend && npm install && npm start
```

### **Cleanup Resources**
```powershell
# Quick cleanup to stop AWS charges
.\scripts\quick-cleanup.ps1

# Complete cleanup with confirmation prompts
.\scripts\cleanup-aws-services.ps1
```

---

## 📊 **Project Metrics**

### **Infrastructure Scale**
- **☁️ AWS Services**: 7+ core services deployed
- **📊 CloudFormation Stacks**: 3 infrastructure stacks
- **🗄️ Database Tables**: 4 DynamoDB tables
- **🔐 Security**: VPC, IAM roles, Security Groups
- **📈 Monitoring**: CloudWatch integration ready

### **Application Scale**
- **📁 Total Files**: 50+ source files
- **💻 Lines of Code**: 2,500+ lines
- **🛠️ React Components**: 10+ reusable components
- **🌐 API Endpoints**: RESTful backend architecture
- **📱 Responsive Design**: Mobile-first approach

---

## 🎯 **Technical Skills Demonstrated**

### **☁️ AWS Cloud Architecture**
- **Infrastructure as Code**: CloudFormation templates for reproducible deployments
- **Multi-tier Architecture**: Separated frontend, backend, and database layers
- **Security Best Practices**: VPC isolation, IAM roles, Security Groups
- **Scalable Design**: Auto-scaling ready infrastructure
- **Cost Optimization**: Efficient resource allocation and cleanup automation

### **💻 Full-Stack Development**
- **Frontend**: React 18 with TypeScript, responsive design, state management
- **Backend**: Node.js/Express RESTful API with AWS SDK integration
- **Database**: DynamoDB NoSQL design with proper indexing
- **DevOps**: Automated deployment scripts and environment management

### **🛠️ Professional Development Practices**
- **Version Control**: Git workflow with structured commits
- **Documentation**: Comprehensive README and inline code documentation
- **Code Organization**: Modular architecture with separation of concerns
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Testing Ready**: Structure prepared for unit and integration testing

---

## 🏆 **Why This Project Stands Out**

### **Enterprise-Ready Architecture**
This project demonstrates **production-level AWS infrastructure** that scales from development to enterprise deployment. The multi-tier architecture, security implementation, and automated deployment showcase skills directly applicable to enterprise environments.

### **Modern Development Stack**
Built with the latest technologies and best practices:
- **React 18 + TypeScript** for type-safe frontend development
- **Node.js + Express** for scalable backend architecture
- **AWS Cloud Services** for enterprise-grade infrastructure
- **Infrastructure as Code** for reproducible deployments

### **Professional Development Practices**
- **Clean Code**: Well-organized, documented, and maintainable codebase
- **Security First**: Proper IAM roles, VPC isolation, and security groups
- **Cost Conscious**: Efficient resource usage with cleanup automation
- **Documentation**: Comprehensive guides for deployment and maintenance

---

## � **Ready for Production**

This infrastructure is designed to handle:
- **High Traffic**: Auto-scaling ready architecture
- **Security**: Enterprise-grade security practices
- **Monitoring**: CloudWatch integration for production monitoring
- **Maintenance**: Automated deployment and cleanup scripts

---

## 📄 **Portfolio Project**

This project demonstrates comprehensive full-stack and cloud development skills suitable for:
- **Senior Developer** positions
- **Cloud Architect** roles
- **DevOps Engineer** positions
- **Full-Stack Engineer** opportunities

---

**⭐ Star this repository if you find the architecture and implementation impressive!**
