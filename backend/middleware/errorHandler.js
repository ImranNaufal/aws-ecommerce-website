const errorHandler = (logger, cloudwatch) => {
  return (err, req, res, next) => {
    // Log the error
    logger.error('API Error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Send error metric to CloudWatch
    if (cloudwatch) {
      cloudwatch.putMetricData({
        Namespace: 'ECommerce/API',
        MetricData: [{
          MetricName: 'APIErrors',
          Value: 1,
          Unit: 'Count',
          Dimensions: [{
            Name: 'ErrorType',
            Value: err.name || 'UnknownError'
          }, {
            Name: 'Endpoint',
            Value: req.route ? req.route.path : req.url
          }],
          Timestamp: new Date()
        }]
      }).promise().catch(metricErr => {
        logger.error('Failed to send error metric to CloudWatch:', metricErr);
      });
    }

    // Handle specific error types
    let statusCode = 500;
    let message = 'Internal server error';
    let details = null;

    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
      details = err.details;
    } else if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
      statusCode = 401;
      message = 'Unauthorized access';
    } else if (err.name === 'ForbiddenError' || err.message.includes('forbidden')) {
      statusCode = 403;
      message = 'Access forbidden';
    } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.name === 'ConflictError' || err.message.includes('conflict')) {
      statusCode = 409;
      message = 'Resource conflict';
    } else if (err.name === 'TooManyRequestsError' || err.message.includes('rate limit')) {
      statusCode = 429;
      message = 'Too many requests';
    }

    // AWS SDK specific errors
    if (err.code) {
      switch (err.code) {
        case 'ConditionalCheckFailedException':
          statusCode = 409;
          message = 'Resource conflict or condition failed';
          break;
        case 'ResourceNotFoundException':
          statusCode = 404;
          message = 'Resource not found';
          break;
        case 'ValidationException':
          statusCode = 400;
          message = 'Invalid request parameters';
          break;
        case 'AccessDeniedException':
          statusCode = 403;
          message = 'Access denied';
          break;
        case 'ThrottlingException':
        case 'ProvisionedThroughputExceededException':
          statusCode = 429;
          message = 'Service temporarily unavailable';
          break;
        case 'ServiceUnavailableException':
          statusCode = 503;
          message = 'Service temporarily unavailable';
          break;
      }
    }

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const errorResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      requestId: req.id || req.headers['x-request-id']
    };

    if (details) {
      errorResponse.details = details;
    }

    if (isDevelopment) {
      errorResponse.stack = err.stack;
      errorResponse.originalError = err.message;
    }

    res.status(statusCode).json(errorResponse);
  };
};

module.exports = errorHandler;
