// AWS Amplify Configuration
// This file configures AWS Amplify services for the e-commerce application

const awsconfig = {
    // AWS Region
    aws_project_region: process.env.REACT_APP_REGION || 'ap-southeast-1',
    
    // API Gateway Configuration
    aws_cloud_logic_custom: [
        {
            name: 'ecommerceAPI',
            endpoint: process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001/api',
            region: process.env.REACT_APP_REGION || 'ap-southeast-1'
        }
    ],

    // Analytics Configuration (optional)
    aws_mobile_analytics_app_id: process.env.REACT_APP_ANALYTICS_APP_ID || '',
    aws_mobile_analytics_app_region: process.env.REACT_APP_REGION || 'ap-southeast-1',

    // Authentication Configuration (for future use)
    aws_cognito_identity_pool_id: process.env.REACT_APP_IDENTITY_POOL_ID || '',
    aws_cognito_region: process.env.REACT_APP_REGION || 'ap-southeast-1',
    aws_user_pools_id: process.env.REACT_APP_USER_POOL_ID || '',
    aws_user_pools_web_client_id: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
    oauth: {},

    // Storage Configuration (for future use)
    aws_user_files_s3_bucket: process.env.REACT_APP_S3_BUCKET || '',
    aws_user_files_s3_bucket_region: process.env.REACT_APP_REGION || 'ap-southeast-1',

    // Hosting Configuration
    aws_content_delivery_bucket: process.env.REACT_APP_S3_BUCKET || '',
    aws_content_delivery_bucket_region: process.env.REACT_APP_REGION || 'ap-southeast-1',
    aws_content_delivery_url: process.env.REACT_APP_CLOUDFRONT_URL || '',

    // Environment
    environment: process.env.REACT_APP_ENVIRONMENT || 'development'
};

export default awsconfig;
