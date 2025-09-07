const express = require('express');
const { body, param, validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const router = express.Router();

const dynamodb = new AWS.DynamoDB.DocumentClient();

const CART_TABLE = process.env.CART_TABLE || 'mini-ecommerce-dev-Cart';
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'mini-ecommerce-dev-Products';

// Validation middleware
const validateCartItem = [
  body('userId').trim().isLength({ min: 1 }).withMessage('User ID is required'),
  body('productId').trim().isLength({ min: 1 }).withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
];

const validateUserId = [
  param('userId').trim().isLength({ min: 1 }).withMessage('User ID is required')
];

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

// GET /api/cart/:userId - Get user's cart
router.get('/:userId', validateUserId, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get cart items
    const cartResult = await dynamodb.query({
      TableName: CART_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();
    
    if (cartResult.Items.length === 0) {
      return res.json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalAmount: 0
        }
      });
    }
    
    // Get product details for each cart item
    const productIds = cartResult.Items.map(item => item.productId);
    const productPromises = productIds.map(productId =>
      dynamodb.get({
        TableName: PRODUCTS_TABLE,
        Key: { productId }
      }).promise()
    );
    
    const productResults = await Promise.all(productPromises);
    const products = productResults.reduce((acc, result) => {
      if (result.Item) {
        acc[result.Item.productId] = result.Item;
      }
      return acc;
    }, {});
    
    // Combine cart items with product details
    const cartItems = cartResult.Items
      .filter(cartItem => products[cartItem.productId]) // Only include items with valid products
      .map(cartItem => {
        const product = products[cartItem.productId];
        return {
          userId: cartItem.userId,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          addedAt: cartItem.addedAt,
          product: {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category
          },
          subtotal: product.price * cartItem.quantity
        };
      });
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    res.json({
      success: true,
      data: {
        items: cartItems,
        totalItems,
        totalAmount: Math.round(totalAmount * 100) / 100 // Round to 2 decimal places
      }
    });
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart items'
    });
  }
});

// POST /api/cart - Add item to cart
router.post('/', validateCartItem, handleValidationErrors, async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    
    // Verify product exists and is active
    const productResult = await dynamodb.get({
      TableName: PRODUCTS_TABLE,
      Key: { productId }
    }).promise();
    
    if (!productResult.Item || !productResult.Item.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not available'
      });
    }
    
    const ttl = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
    const now = new Date().toISOString();
    
    // Check if item already exists in cart
    const existingItem = await dynamodb.get({
      TableName: CART_TABLE,
      Key: { userId, productId }
    }).promise();
    
    if (existingItem.Item) {
      // Update quantity
      const newQuantity = Math.min(existingItem.Item.quantity + quantity, 99);
      
      await dynamodb.update({
        TableName: CART_TABLE,
        Key: { userId, productId },
        UpdateExpression: 'SET quantity = :quantity, updatedAt = :updatedAt, ttl = :ttl',
        ExpressionAttributeValues: {
          ':quantity': newQuantity,
          ':updatedAt': now,
          ':ttl': ttl
        }
      }).promise();
      
      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: {
          userId,
          productId,
          quantity: newQuantity,
          updatedAt: now
        }
      });
    } else {
      // Add new item
      const cartItem = {
        userId,
        productId,
        quantity,
        addedAt: now,
        updatedAt: now,
        ttl
      };
      
      await dynamodb.put({
        TableName: CART_TABLE,
        Item: cartItem
      }).promise();
      
      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: cartItem
      });
    }
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/:userId/:productId - Update cart item quantity
router.put('/:userId/:productId', [
  param('userId').trim().isLength({ min: 1 }).withMessage('User ID is required'),
  param('productId').trim().isLength({ min: 1 }).withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], handleValidationErrors, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    
    const ttl = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    const now = new Date().toISOString();
    
    const result = await dynamodb.update({
      TableName: CART_TABLE,
      Key: { userId, productId },
      UpdateExpression: 'SET quantity = :quantity, updatedAt = :updatedAt, ttl = :ttl',
      ExpressionAttributeValues: {
        ':quantity': quantity,
        ':updatedAt': now,
        ':ttl': ttl
      },
      ConditionExpression: 'attribute_exists(userId) AND attribute_exists(productId)',
      ReturnValues: 'ALL_NEW'
    }).promise();
    
    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: result.Attributes
    });
    
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item'
    });
  }
});

// DELETE /api/cart/:userId/:productId - Remove item from cart
router.delete('/:userId/:productId', [
  param('userId').trim().isLength({ min: 1 }).withMessage('User ID is required'),
  param('productId').trim().isLength({ min: 1 }).withMessage('Product ID is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    await dynamodb.delete({
      TableName: CART_TABLE,
      Key: { userId, productId },
      ConditionExpression: 'attribute_exists(userId) AND attribute_exists(productId)'
    }).promise();
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
    
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove cart item'
    });
  }
});

// DELETE /api/cart/:userId - Clear entire cart
router.delete('/:userId', validateUserId, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all cart items for the user
    const cartResult = await dynamodb.query({
      TableName: CART_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();
    
    if (cartResult.Items.length === 0) {
      return res.json({
        success: true,
        message: 'Cart is already empty'
      });
    }
    
    // Delete all items
    const deletePromises = cartResult.Items.map(item =>
      dynamodb.delete({
        TableName: CART_TABLE,
        Key: {
          userId: item.userId,
          productId: item.productId
        }
      }).promise()
    );
    
    await Promise.all(deletePromises);
    
    res.json({
      success: true,
      message: `Cart cleared successfully. Removed ${cartResult.Items.length} items.`
    });
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

module.exports = router;
