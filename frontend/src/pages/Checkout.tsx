import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      const newOrderId = `ORD-${Date.now()}`;
      setOrderId(newOrderId);
      setOrderComplete(true);
      setIsProcessing(false);
      clearCart();
    }, 2000);
  };

  if (cart.totalItems === 0 && !orderComplete) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products before proceeding to checkout.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">✅</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase!</p>
            <div className="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Total:</strong> ${cart.totalAmount.toFixed(2)}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>
            <div className="success-actions">
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="form-section">
                <h3>Contact Information</h3>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section">
                <h3>Shipping Address</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="SG">Singapore</option>
                    <option value="MY">Malaysia</option>
                  </select>
                </div>
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h3>Payment Information</h3>
                <div className="form-group">
                  <label htmlFor="cardName">Name on Card *</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date *</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg checkout-submit"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Order...' : `Complete Order - $${cart.totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.items.map((item) => (
                <div key={item.productId} className="summary-item">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="summary-item-image"
                  />
                  <div className="summary-item-info">
                    <h4>{item.product.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    <p className="summary-item-price">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
