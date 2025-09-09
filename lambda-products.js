const sampleProducts = [
  {
    productId: 'prod-001',
    name: 'Premium Laptop',
    description: 'High-performance laptop with latest specs and premium build quality',
    price: 999.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-002',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring and GPS',
    price: 299.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-003',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 199.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-004',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable 100% organic cotton t-shirt available in multiple colors',
    price: 29.99,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-005',
    name: 'Professional Coffee Maker',
    description: '12-cup programmable coffee maker with thermal carafe',
    price: 149.99,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-006',
    name: 'Gaming Mechanical Keyboard',
    description: 'RGB backlit mechanical gaming keyboard with blue switches',
    price: 129.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-007',
    name: 'Bluetooth Speaker Portable',
    description: 'Waterproof portable Bluetooth speaker with 20-hour battery',
    price: 79.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    productId: 'prod-008',
    name: 'Yoga Mat Premium',
    description: 'Non-slip premium yoga mat with carrying strap',
    price: 49.99,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
  
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }
    
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: sampleProducts
        })
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
