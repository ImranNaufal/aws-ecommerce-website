import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

interface CartItem {
  userId: string;
  productId: string;
  quantity: number;
  addedAt: string;
  product: Product;
  subtotal: number;
}

interface CartData {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartContextType {
  cart: CartData;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartData>({
    items: [],
    totalItems: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';
  
  // For demo purposes, we'll use a static user ID
  // In a real app, this would come from authentication
  const userId = 'demo-user-001';

  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API, fallback to localStorage
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart/${userId}`, { timeout: 5000 });
        if (response.data.success) {
          setCart(response.data.data);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using localStorage cart');
      }
      
      // Fallback to localStorage
      const localCart = localStorage.getItem('ministore-cart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        setCart(parsedCart);
      } else {
        setCart({ items: [], totalItems: 0, totalAmount: 0 });
      }
      
    } catch (err) {
      console.error('Error refreshing cart:', err);
      setError('Failed to load cart');
      // Load from localStorage as final fallback
      const localCart = localStorage.getItem('ministore-cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (cartData: CartData) => {
    localStorage.setItem('ministore-cart', JSON.stringify(cartData));
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = await axios.post(`${API_BASE_URL}/api/cart`, {
          userId,
          productId: product.productId,
          quantity
        }, { timeout: 5000 });

        if (response.data.success) {
          await refreshCart();
          return;
        }
      } catch (apiError) {
        console.log('API not available, using localStorage');
      }

      // Fallback to localStorage
      const existingItemIndex = cart.items.findIndex(item => item.productId === product.productId);
      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...cart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: Math.min(newItems[existingItemIndex].quantity + quantity, 99),
          subtotal: product.price * Math.min(newItems[existingItemIndex].quantity + quantity, 99)
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          userId,
          productId: product.productId,
          quantity,
          addedAt: new Date().toISOString(),
          product,
          subtotal: product.price * quantity
        };
        newItems = [...cart.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      const newCart = {
        items: newItems,
        totalItems,
        totalAmount: Math.round(totalAmount * 100) / 100
      };

      setCart(newCart);
      saveToLocalStorage(newCart);

    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = await axios.put(`${API_BASE_URL}/api/cart/${userId}/${productId}`, {
          quantity
        }, { timeout: 5000 });

        if (response.data.success) {
          await refreshCart();
          return;
        }
      } catch (apiError) {
        console.log('API not available, using localStorage');
      }

      // Fallback to localStorage
      const newItems = cart.items.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            subtotal: item.product.price * quantity
          };
        }
        return item;
      });

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      const newCart = {
        items: newItems,
        totalItems,
        totalAmount: Math.round(totalAmount * 100) / 100
      };

      setCart(newCart);
      saveToLocalStorage(newCart);

    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart item');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/cart/${userId}/${productId}`, { timeout: 5000 });
        if (response.data.success) {
          await refreshCart();
          return;
        }
      } catch (apiError) {
        console.log('API not available, using localStorage');
      }

      // Fallback to localStorage
      const newItems = cart.items.filter(item => item.productId !== productId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      const newCart = {
        items: newItems,
        totalItems,
        totalAmount: Math.round(totalAmount * 100) / 100
      };

      setCart(newCart);
      saveToLocalStorage(newCart);

    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API first
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/cart/${userId}`, { timeout: 5000 });
        if (response.data.success) {
          setCart({ items: [], totalItems: 0, totalAmount: 0 });
          localStorage.removeItem('ministore-cart');
          return;
        }
      } catch (apiError) {
        console.log('API not available, clearing localStorage');
      }

      // Fallback to localStorage
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      localStorage.removeItem('ministore-cart');

    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
