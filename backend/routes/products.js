const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'mini-ecommerce-dev-Products';
const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'mini-ecommerce-dev-Inventory';

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Product name is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be less than 500 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

const validateProductId = [
  param('id').trim().isLength({ min: 1 }).withMessage('Product ID is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// GET /api/products - Get all products with optional filtering
router.get('/', [
  query('category').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('lastKey').optional().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { category, limit = 20, lastKey } = req.query;
    
    let params = {
      TableName: PRODUCTS_TABLE,
      Limit: parseInt(limit)
    };
    
    // Add pagination
    if (lastKey) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pagination key'
        });
      }
    }
    
    let result;
    
    if (category) {
      // Query by category using GSI
      params.IndexName = 'CategoryIndex';
      params.KeyConditionExpression = 'category = :category';
      params.ExpressionAttributeValues = {
        ':category': category
      };
      params.ScanIndexForward = false; // Sort by createdAt descending
      
      result = await dynamodb.query(params).promise();
    } else {
      // Scan all products
      result = await dynamodb.scan(params).promise();
    }
    
    // Prepare pagination token
    let nextKey = null;
    if (result.LastEvaluatedKey) {
      nextKey = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }
    
    res.json({
      success: true,
      data: result.Items,
      count: result.Count,
      nextKey,
      hasMore: !!result.LastEvaluatedKey
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await dynamodb.get({
      TableName: PRODUCTS_TABLE,
      Key: { productId: id }
    }).promise();
    
    if (!result.Item) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Get inventory information
    const inventoryResult = await dynamodb.get({
      TableName: INVENTORY_TABLE,
      Key: { productId: id }
    }).promise();
    
    const product = {
      ...result.Item,
      stock: inventoryResult.Item ? inventoryResult.Item.stock : 0,
      reserved: inventoryResult.Item ? inventoryResult.Item.reserved : 0
    };
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// POST /api/products - Create new product (admin only)
router.post('/', validateProduct, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock = 0 } = req.body;
    
    const productId = uuidv4();
    const now = new Date().toISOString();
    
    const product = {
      productId,
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl: imageUrl || '',
      createdAt: now,
      updatedAt: now,
      isActive: true
    };
    
    // Create product
    await dynamodb.put({
      TableName: PRODUCTS_TABLE,
      Item: product,
      ConditionExpression: 'attribute_not_exists(productId)'
    }).promise();
    
    // Create inventory record
    if (stock > 0) {
      await dynamodb.put({
        TableName: INVENTORY_TABLE,
        Item: {
          productId,
          stock: parseInt(stock),
          reserved: 0,
          updatedAt: now
        }
      }).promise();
    }
    
    res.status(201).json({
      success: true,
      data: { ...product, stock: parseInt(stock) },
      message: 'Product created successfully'
    });
    
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(409).json({
        success: false,
        error: 'Product with this ID already exists'
      });
    }
    
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', [...validateProductId, ...validateProduct], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, stock } = req.body;
    
    const now = new Date().toISOString();
    
    // Update product
    const updateExpression = 'SET #name = :name, description = :description, price = :price, category = :category, imageUrl = :imageUrl, updatedAt = :updatedAt';
    const expressionAttributeNames = {
      '#name': 'name' // 'name' is a reserved word in DynamoDB
    };
    const expressionAttributeValues = {
      ':name': name,
      ':description': description,
      ':price': parseFloat(price),
      ':category': category,
      ':imageUrl': imageUrl || '',
      ':updatedAt': now
    };
    
    const result = await dynamodb.update({
      TableName: PRODUCTS_TABLE,
      Key: { productId: id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(productId)',
      ReturnValues: 'ALL_NEW'
    }).promise();
    
    // Update inventory if stock is provided
    if (typeof stock !== 'undefined') {
      await dynamodb.put({
        TableName: INVENTORY_TABLE,
        Item: {
          productId: id,
          stock: parseInt(stock),
          reserved: 0,
          updatedAt: now
        }
      }).promise();
    }
    
    res.json({
      success: true,
      data: result.Attributes,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', validateProductId, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete - mark as inactive
    const result = await dynamodb.update({
      TableName: PRODUCTS_TABLE,
      Key: { productId: id },
      UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':isActive': false,
        ':updatedAt': new Date().toISOString()
      },
      ConditionExpression: 'attribute_exists(productId)',
      ReturnValues: 'ALL_NEW'
    }).promise();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// GET /api/products/categories - Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await dynamodb.scan({
      TableName: PRODUCTS_TABLE,
      ProjectionExpression: 'category',
      FilterExpression: 'isActive = :isActive',
      ExpressionAttributeValues: {
        ':isActive': true
      }
    }).promise();
    
    const categories = [...new Set(result.Items.map(item => item.category))].sort();
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
