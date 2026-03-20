import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CART_KEY = 'app_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const persist = useCallback((next) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback((book, quantity = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === book.id);
      let next;
      if (i >= 0) {
        next = [...prev];
        next[i] = { ...next[i], quantity: (next[i].quantity || 1) + quantity };
      } else {
        next = [...prev, { ...book, quantity }];
      }
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((bookId, quantity) => {
    if (quantity < 1) {
      setItems((prev) => {
        const next = prev.filter((x) => x.id !== bookId);
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }
    setItems((prev) => {
      const next = prev.map((x) => (x.id === bookId ? { ...x, quantity } : x));
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((bookId) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== bookId);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const totalItems = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = 2;
  const total = subtotal + shipping;

  const value = {
    items,
    totalItems,
    subtotal,
    shipping,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
