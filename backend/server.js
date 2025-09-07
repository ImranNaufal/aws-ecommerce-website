const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AWS = require('aws-sdk');
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const metricsMiddleware = require('./middleware/metrics');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatch();
const s3 = new AWS.S3();

// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ecommerce-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add CloudWatch logging in production
if (NODE_ENV === 'production') {
  logger.add(new WinstonCloudWatch({
    logGroupName: '/aws/ec2/ecommerce-api',
    logStreamName: `${require('os').hostname()}-${new Date().toISOString().split('T')[0]}`,
    awsRegion: process.env.AWS_REGION || 'ap-southeast-1'
  }));
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL,
      /\.amplifyapp\.com$/,
      /\.s3-website-.*\.amazonaws\.com$/
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

app.use(limiter);

// Metrics middleware
app.use(metricsMiddleware(cloudwatch, logger));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };
  
  logger.info('Health check requested', healthCheck);
  res.json(healthCheck);
});

// Detailed health check for load balancer
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: false,
    s3: false,
    cloudwatch: false
  };
  
  try {
    // Test DynamoDB connection
    await dynamodb.scan({
      TableName: process.env.PRODUCTS_TABLE || 'mini-ecommerce-dev-Products',
      Limit: 1
    }).promise();
    checks.database = true;
  } catch (error) {
    logger.error('Database health check failed:', error);
  }
  
  try {
    // Test S3 connection
    await s3.listBuckets().promise();
    checks.s3 = true;
  } catch (error) {
    logger.error('S3 health check failed:', error);
  }
  
  try {
    // Test CloudWatch connection
    await cloudwatch.putMetricData({
      Namespace: 'ECommerce/HealthCheck',
      MetricData: [{
        MetricName: 'HealthCheck',
        Value: 1,
        Unit: 'Count'
      }]
    }).promise();
    checks.cloudwatch = true;
  } catch (error) {
    logger.error('CloudWatch health check failed:', error);
  }
  
  const allHealthy = Object.values(checks).every(check => check === true);
  const status = allHealthy ? 200 : 503;
  
  res.status(status).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'E-commerce API',
    version: '1.0.0',
    description: 'RESTful API for e-commerce application',
    endpoints: {
      products: {
        'GET /api/products': 'Get all products',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product (admin)',
        'PUT /api/products/:id': 'Update product (admin)',
        'DELETE /api/products/:id': 'Delete product (admin)'
      },
      cart: {
        'GET /api/cart/:userId': 'Get user cart',
        'POST /api/cart': 'Add item to cart',
        'PUT /api/cart/:userId/:productId': 'Update cart item',
        'DELETE /api/cart/:userId/:productId': 'Remove item from cart'
      },
      orders: {
        'GET /api/orders/:userId': 'Get user orders',
        'POST /api/orders': 'Create new order',
        'GET /api/orders/order/:orderId': 'Get order by ID',
        'PUT /api/orders/:orderId/status': 'Update order status (admin)'
      },
      users: {
        'POST /api/users/register': 'Register new user',
        'POST /api/users/login': 'User login',
        'GET /api/users/profile': 'Get user profile (authenticated)',
        'PUT /api/users/profile': 'Update user profile (authenticated)'
      },
      payments: {
        'POST /api/payments/intent': 'Create payment intent',
        'POST /api/payments/confirm': 'Confirm payment',
        'GET /api/payments/:paymentId': 'Get payment details'
      }
    },
    authentication: 'Bearer token required for protected endpoints',
    rateLimit: '100 requests per 15 minutes per IP'
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use(errorHandler(logger, cloudwatch));

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`E-commerce API server running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`AWS Region: ${process.env.AWS_REGION || 'ap-southeast-1'}`);
  
  // Send startup metric to CloudWatch
  cloudwatch.putMetricData({
    Namespace: 'ECommerce/API',
    MetricData: [{
      MetricName: 'ServerStartup',
      Value: 1,
      Unit: 'Count',
      Timestamp: new Date()
    }]
  }).promise().catch(err => logger.error('Failed to send startup metric:', err));
});

// Export for testing
module.exports = { app, server };
