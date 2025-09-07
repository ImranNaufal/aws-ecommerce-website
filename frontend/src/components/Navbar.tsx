import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import './Navbar.css';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated = false,
  onLogout
}) => {
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🛒</span>
          <span className="logo-text">MiniStore</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-nav">
            <Link 
              to="/" 
              className="nav-link"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="nav-link"
              onClick={closeMenu}
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link 
                to="/orders" 
                className="nav-link"
                onClick={closeMenu}
              >
                Orders
              </Link>
            )}
          </div>

          <div className="navbar-actions">
            {/* Cart */}
            <Link 
              to="/cart" 
              className="nav-link cart-link"
              onClick={closeMenu}
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
              {cart.totalItems > 0 && (
                <span className="cart-badge">{cart.totalItems}</span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="auth-menu">
                <Link 
                  to="/profile" 
                  className="nav-link profile-link"
                  onClick={closeMenu}
                >
                  <span className="profile-icon">👤</span>
                  <span className="profile-text">Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="nav-link logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-menu">
                <Link 
                  to="/login" 
                  className="nav-link login-link"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="nav-link register-link"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
