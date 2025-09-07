import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';

const Cart: React.FC = () => {
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="error-message">
            <p>Error loading cart: {error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.totalItems === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Your cart is currently empty.</p>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart ({cart.totalItems} items)</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.productId} className="cart-item">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.product.name}</h3>
                  <p className="cart-item-description">{item.product.description}</p>
                  <p className="cart-item-category">{item.product.category}</p>
                  <p className="cart-item-price">${item.product.price}</p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-item-subtotal">${item.subtotal.toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Items ({cart.totalItems}):</span>
              <span>${cart.totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-line total">
              <span>Total:</span>
              <span>${cart.totalAmount.toFixed(2)}</span>
            </div>

            <div className="cart-actions">
              <button
                onClick={clearCart}
                className="btn btn-secondary"
              >
                Clear Cart
              </button>
              <Link to="/checkout" className="btn btn-primary">
                Proceed to Checkout
              </Link>
            </div>

            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
