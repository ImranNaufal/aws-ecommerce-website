import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context
import { CartProvider } from './context/CartContext.tsx';

// Components
import Navbar from './components/Navbar.tsx';

// Pages
import Home from './pages/Home.tsx';
import Products from './pages/Products.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// Styles
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <CartProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </div>
  );
};

export default App;
