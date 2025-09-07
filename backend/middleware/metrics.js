const metricsMiddleware = (cloudwatch, logger) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Generate unique request ID
    req.id = require('uuid').v4();
    res.setHeader('X-Request-ID', req.id);
    
    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Log request details
      logger.info('API Request', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      // Send metrics to CloudWatch
      const metrics = [
        {
          MetricName: 'RequestCount',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'Method', Value: req.method },
            { Name: 'StatusCode', Value: res.statusCode.toString() }
          ]
        },
        {
          MetricName: 'ResponseTime',
          Value: responseTime,
          Unit: 'Milliseconds',
          Dimensions: [
            { Name: 'Method', Value: req.method },
            { Name: 'Endpoint', Value: req.route ? req.route.path : req.url }
          ]
        }
      ];
      
      // Add error metrics for non-2xx responses
      if (res.statusCode >= 400) {
        metrics.push({
          MetricName: 'ErrorCount',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'StatusCode', Value: res.statusCode.toString() },
            { Name: 'Method', Value: req.method }
          ]
        });
      }
      
      // Send metrics to CloudWatch (async, don't block response)
      cloudwatch.putMetricData({
        Namespace: 'ECommerce/API',
        MetricData: metrics.map(metric => ({
          ...metric,
          Timestamp: new Date()
        }))
      }).promise().catch(err => {
        logger.error('Failed to send metrics to CloudWatch:', err);
      });
      
      // Call original end method
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

module.exports = metricsMiddleware;
