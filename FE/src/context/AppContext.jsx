import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../config/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  
  // Modals state (managed globally since they are shared or we can manage them locally, but cart is global)
  const [cartModalOpen, setCartModalOpen] = useState(false);

  useEffect(() => {
    // Load Token/User
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); // Simplification, normally decode or fetch user profile
    }

    // Load Cart
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        setCart([]);
      }
    }

    // Load Products
    fetch(`${API_BASE}/product/get-all-products`)
      .then(res => res.json())
      .then(result => {
        if (result && result.success) {
          setProducts(result.data);
        }
      })
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  const addToCart = (product, quantity, size = '') => {
    setCart(prevCart => {
      const existing = prevCart.find(item => 
        item.productId === product.id && item.size === size
      );
      
      let newCart;
      if (existing) {
        newCart = prevCart.map(item => 
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          quantity, 
          size, 
          emoji: '🟢',
          image: product.image
        }];
      }
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      // Show toast manually or via effect
      const toastEl = document.getElementById('cartToast');
      if (toastEl && window.bootstrap) {
         toastEl.querySelector('.toast-body').textContent = `✅ ${quantity}x ${product.name}${size ? ' ('+size+')' : ''} added!`;
         new window.bootstrap.Toast(toastEl, { delay: 2000, autohide: true }).show();
      }
      return newCart;
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => {
      const newCart = prev.filter((_, i) => i !== index);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };
  
  const updateCartQuantity = (index, delta) => {
    setCart(prev => {
      const newCart = [...prev];
      if (newCart[index]) {
         const newQty = newCart[index].quantity + delta;
         if (newQty > 0) newCart[index].quantity = newQty;
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/user/login`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    localStorage.setItem('token', data.token);
    setUser({ token: data.token, name: data.data?.name });
    
    const toastEl = document.getElementById('loginToast');
    if (toastEl && window.bootstrap) {
       toastEl.querySelector('.toast-body').textContent = `Hello again, ${data.data?.name}!`;
       new window.bootstrap.Toast(toastEl, { delay: 2000 }).show();
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const signup = async (name, email, password, phone) => {
    const res = await fetch(`${API_BASE}/user/register`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ name, email, password, phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    return data;
  };

  return (
    <AppContext.Provider value={{ 
      products, 
      cart, 
      addToCart, 
      removeFromCart, 
      updateCartQuantity,
      clearCart,
      user, 
      login, 
      logout,
      signup,
      cartModalOpen, 
      setCartModalOpen 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
