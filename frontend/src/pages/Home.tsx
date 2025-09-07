import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Try to fetch from API first
        try {
          const productsResponse = await axios.get(`${API_BASE_URL}/api/products?limit=6`, { timeout: 5000 });
          if (productsResponse.data.success) {
            setFeaturedProducts(productsResponse.data.data);
          }

          const categoriesResponse = await axios.get(`${API_BASE_URL}/api/products/meta/categories`, { timeout: 5000 });
          if (categoriesResponse.data.success) {
            setCategories(categoriesResponse.data.data.slice(0, 6));
          }
        } catch (apiError) {
          console.log('API not available, using fallback data');
          // Fallback to static data when API is not available
          setFeaturedProducts([
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
            }
          ]);
          setCategories(['Electronics', 'Clothing', 'Home & Kitchen', 'Sports & Fitness']);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <div className="error-content">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-name">MiniStore</span>
            </h1>
            <p className="hero-subtitle">
              Discover amazing products at unbeatable prices. 
              Your one-stop shop for everything you need.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <span className="hero-icon">🛍️</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free delivery on orders over $50</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>Your payment information is safe</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">↩️</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Products</h3>
              <p>Carefully curated selection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="categories">
          <div className="container">
            <h2 className="section-title">Shop by Category</h2>
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="category-card"
                >
                  <div className="category-icon">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="category-name">{category}</h3>
                  <p className="category-link">Shop Now →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-products">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
              <Link to="/products" className="section-link">
                View All Products →
              </Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product.productId} className="product-card">
                  <Link to={`/products/${product.productId}`} className="product-link">
                    <div className="product-image-container">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.png';
                          }}
                        />
                      ) : (
                        <div className="product-placeholder">
                          <span className="placeholder-icon">📦</span>
                        </div>
                      )}
                      <div className="product-overlay">
                        <span className="view-product">View Product</span>
                      </div>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{product.category}</span>
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-description">
                        {product.description.length > 80
                          ? `${product.description.substring(0, 80)}...`
                          : product.description
                        }
                      </p>
                      <div className="product-price">${product.price.toFixed(2)}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Shopping?</h2>
            <p>Join thousands of satisfied customers and discover your next favorite product.</p>
            <div className="cta-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse All Products
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper function to get category icons
const getCategoryIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    'Electronics': '📱',
    'Clothing': '👕',
    'Books': '📚',
    'Home': '🏠',
    'Sports': '⚽',
    'Beauty': '💄',
    'Toys': '🧸',
    'Food': '🍕',
    'Health': '💊',
    'Automotive': '🚗'
  };
  
  return iconMap[category] || '🛍️';
};

export default Home;
