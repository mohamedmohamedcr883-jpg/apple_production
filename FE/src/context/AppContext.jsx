import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../config/api';
import { getItemPrice, normalizeSize } from '../utils/pricing';

const AppContext = createContext();

// Saved carts can hold old prices, removed products, or the same item under different size spellings
const syncCart = (items, products) => {
  const synced = [];
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;
    const size = normalizeSize(item.size);
    const existing = synced.find(i => i.productId === item.productId && i.size === size);
    if (existing) existing.quantity += item.quantity;
    else synced.push({ ...item, size, price: getItemPrice(product, size) });
  });
  localStorage.setItem('cart', JSON.stringify(synced));
  return synced;
};

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Modals state (managed globally since they are shared or we can manage them locally, but cart is global)
  const [cartModalOpen, setCartModalOpen] = useState(false);

  useEffect(() => {
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
          setCart(prev => syncCart(prev, result.data));
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

  return (
    <AppContext.Provider value={{ 
      products, 
      cart, 
      addToCart, 
      removeFromCart, 
      updateCartQuantity,
      clearCart,
      cartModalOpen, 
      setCartModalOpen 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
