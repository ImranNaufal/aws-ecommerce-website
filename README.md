# 🛍️ AWS E-commerce Website

**Professional full-stack e-commerce website built with React, Node.js, and complete AWS infrastructure.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Website-blue?style=for-the-badge)](http://mini-ecommerce-dev-website-834308799940.s3-website-ap-southeast-1.amazonaws.com)
[![AWS](https://img.shields.io/badge/AWS-Cloud%20Infrastructure-orange?style=for-the-badge)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

---

## 🌐 **Live Demo**
**[🚀 View Live Website](http://mini-ecommerce-dev-website-834308799940.s3-website-ap-southeast-1.amazonaws.com)**

*Complete e-commerce functionality with shopping cart, checkout, and AWS infrastructure*

---

## 📋 **Project Overview**

This is a **production-ready e-commerce website** showcasing modern full-stack development with AWS cloud infrastructure. The project demonstrates enterprise-level architecture, clean code practices, and professional deployment strategies.

### **🎯 Key Achievements**
- ✅ **Complete E-commerce Platform** with shopping cart and checkout
- ✅ **AWS Infrastructure as Code** using CloudFormation templates
- ✅ **Professional UI/UX** with responsive design
- ✅ **Production Deployment** on AWS with live demo
- ✅ **Modern Tech Stack** with React TypeScript and Node.js

---

## 🛠️ **Technologies Used**

### **Frontend**
- **React 18** with TypeScript
- **CSS3** with responsive design
- **React Router** for navigation
- **Context API** for state management

### **Backend**
- **Node.js** with Express.js
- **AWS SDK** for cloud integration
- **RESTful APIs** for data operations
- **PM2** for process management

### **Database**
- **Amazon DynamoDB** for product and cart data
- **NoSQL** data modeling
- **AWS SDK** for database operations

### **Infrastructure & Deployment**
- **AWS CloudFormation** for Infrastructure as Code
- **AWS Amplify** for CI/CD pipeline and hosting
- **Amazon S3** for static website hosting
- **Amazon EC2** for backend API hosting
- **AWS CLI** for deployment automation

### **Monitoring & Analytics**
- **Amazon CloudWatch** for monitoring and logging
- **AWS SNS** for notifications and alerts
- **CloudWatch Dashboards** for real-time metrics
- **Custom Metrics** for application performance

### **Serverless & API Management**
- **AWS Lambda** for serverless functions
- **Amazon API Gateway** for API management
- **EventBridge** for scheduled tasks
- **Usage Plans** for API rate limiting

---

## ✨ **Features**

### **🛍️ E-commerce Functionality**
- **Product Catalog**: 8 products across 4 categories
- **Shopping Cart**: Add, remove, and modify quantities
- **Checkout System**: Complete order processing flow
- **Order Management**: Order confirmation and tracking
- **Responsive Design**: Mobile-friendly interface

### **🏗️ Technical Features**
- **AWS Infrastructure**: Complete cloud architecture
- **API Integration**: RESTful backend services
- **State Management**: React Context for cart state
- **Error Handling**: Graceful fallback systems
- **Performance**: Optimized loading and caching

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React SPA     │◄──►│   Node.js API   │◄──►│   DynamoDB      │
│   (S3 Hosting)  │    │   (EC2 Server)  │    │   (NoSQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ AWS CloudFormation │
                    │ Infrastructure as Code │
                    └─────────────────┘
```

### **AWS Services Used**
- **Amplify**: CI/CD pipeline and hosting platform
- **S3**: Static website hosting and file storage
- **EC2**: Backend API server hosting
- **DynamoDB**: NoSQL database for products and cart
- **CloudFormation**: Infrastructure as Code templates
- **IAM**: Security roles and permissions
- **CloudWatch**: Monitoring, logging, and alerting
- **SNS**: Email notifications and alerts
- **Lambda**: Serverless functions for order processing
- **API Gateway**: API management and rate limiting
- **EventBridge**: Scheduled tasks and automation

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
│   ├── 📄 vpc-template.yaml    # Network infrastructure
│   ├── 📄 ec2-template.yaml    # Server infrastructure
│   └── 📄 s3-template.yaml     # Storage infrastructure
├── 📁 scripts/                 # Deployment automation scripts
├── 📄 README.md                # Project documentation
└── 📄 DEPLOYMENT_GUIDE.md      # Deployment instructions
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- AWS CLI configured
- AWS Account with appropriate permissions

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aws-ecommerce-website.git
cd aws-ecommerce-website

# Install frontend dependencies
cd frontend
npm install
npm start

# Install backend dependencies (new terminal)
cd ../backend
npm install
npm start
```

### **AWS Deployment**
```bash
# Deploy infrastructure
aws cloudformation create-stack --stack-name ecommerce-infrastructure --template-body file://infrastructure/vpc-template.yaml

# Deploy frontend
cd frontend
npm run build
aws s3 sync build/ s3://your-bucket-name --delete

# Deploy backend
# (See DEPLOYMENT_GUIDE.md for complete instructions)
```

---

## 📊 **Project Statistics**

- **📁 Files Created**: 60+ files
- **💻 Lines of Code**: 3,000+ lines
- **🛠️ Components**: 15+ React components
- **🌐 API Endpoints**: 15+ RESTful endpoints
- **☁️ AWS Resources**: 25+ cloud resources
- **⚡ Lambda Functions**: 3 serverless functions
- **📊 Monitoring**: Complete CloudWatch setup
- **📱 Responsive**: 100% mobile-friendly

---

## 🎯 **Skills Demonstrated**

### **Frontend Development**
- React with TypeScript
- Component-based architecture
- State management with Context API
- Responsive CSS design
- Modern JavaScript (ES6+)

### **Backend Development**
- Node.js and Express.js
- RESTful API design
- Database integration
- Error handling and validation
- Server deployment and management

### **Cloud & DevOps**
- AWS infrastructure design
- Infrastructure as Code (CloudFormation)
- CI/CD pipeline implementation (Amplify)
- Automated deployments from Git
- Cloud deployment strategies
- Performance optimization

### **Professional Practices**
- Clean code principles
- Project organization
- Documentation
- Version control with Git
- Production deployment

---

## 🏆 **Professional Highlights**

This project showcases **enterprise-level development skills** including:

- ✅ **Full-Stack Expertise**: Complete frontend and backend development
- ✅ **Cloud Architecture**: Professional AWS infrastructure design
- ✅ **Modern Technologies**: Latest React, Node.js, and TypeScript
- ✅ **Production Deployment**: Live, scalable website
- ✅ **Code Quality**: Clean, maintainable, documented code
- ✅ **User Experience**: Professional, responsive design

---

## 📞 **Contact**

**Imran Naufal**
- 📧 Email: [your.email@example.com]
- 💼 LinkedIn: [Your LinkedIn Profile]
- 🌐 Portfolio: [Your Portfolio Website]

---

## 📄 **License**

This project is created for portfolio demonstration purposes.

---

**⭐ If you found this project impressive, please give it a star!**
