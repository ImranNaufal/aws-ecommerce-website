import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext.tsx';

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const { addToCart } = useCart();
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.productId);
      await addToCart(product, 1);
      // Show success feedback
      setTimeout(() => setAddingToCart(null), 1000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Try to fetch from API first
        try {
          const response = await axios.get(`${API_BASE_URL}/api/products`, { timeout: 5000 });
          if (response.data.success) {
            setProducts(response.data.data);
          }
        } catch (apiError) {
          console.log('API not available, using fallback data');
          // Fallback to static data when API is not available
          setProducts([
            {
              productId: 'prod-001',
              name: 'Premium Laptop',
              description: 'High-performance laptop with latest specs and premium build quality',
              price: 999.99,
              category: 'Electronics',
              imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
            },
            {
              productId: 'prod-002',
              name: 'Smart Fitness Watch',
              description: 'Advanced fitness tracker with heart rate monitoring and GPS',
              price: 299.99,
              category: 'Electronics',
              imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
            },
            {
              productId: 'prod-003',
              name: 'Wireless Bluetooth Headphones',
              description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
              price: 199.99,
              category: 'Electronics',
              imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
            },
            {
              productId: 'prod-004',
              name: 'Organic Cotton T-Shirt',
              description: 'Comfortable 100% organic cotton t-shirt available in multiple colors',
              price: 29.99,
              category: 'Clothing',
              imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
            },
            {
              productId: 'prod-005',
              name: 'Professional Coffee Maker',
              description: '12-cup programmable coffee maker with thermal carafe',
              price: 149.99,
              category: 'Home & Kitchen',
              imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
            },
            {
              productId: 'prod-006',
              name: 'Gaming Mechanical Keyboard',
              description: 'RGB backlit mechanical gaming keyboard with blue switches',
              price: 129.99,
              category: 'Electronics',
              imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'
            },
            {
              productId: 'prod-007',
              name: 'Bluetooth Speaker Portable',
              description: 'Waterproof portable Bluetooth speaker with 20-hour battery',
              price: 69.99,
              category: 'Electronics',
              imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'
            },
            {
              productId: 'prod-008',
              name: 'Yoga Mat Premium',
              description: 'Non-slip eco-friendly yoga mat with alignment lines',
              price: 49.99,
              category: 'Sports & Fitness',
              imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
            }
          ]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <h1>All Products</h1>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <h1>All Products</h1>
          <div className="error-message">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>All Products</h1>
        <p>Browse our complete product catalog ({products.length} products).</p>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.productId} className="product-card">
              <img src={product.imageUrl} alt={product.name} />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <span className="category">{product.category}</span>
                  <span className="price">${product.price}</span>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart === product.productId}
                >
                  {addingToCart === product.productId ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
