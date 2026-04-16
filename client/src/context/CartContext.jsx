import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items,   setItems]   = useState([]);
  const [isOpen,  setIsOpen]  = useState(false);
  const [loading, setLoading] = useState(false);

  /* fetchCart — wrapped in useCallback so it can be added to event listeners */
  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data.items || []);
    } catch {
      /* guest with no server: leave items as-is */
    }
  }, []);

  /* initial fetch on mount */
  useEffect(() => { fetchCart(); }, [fetchCart]);

  /* re-sync whenever login / logout happens (AuthContext fires 'auth:change') */
  useEffect(() => {
    const sync = () => fetchCart();
    window.addEventListener('auth:change', sync);
    return () => window.removeEventListener('auth:change', sync);
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      await api.post('/cart', { product_id: productId, quantity });
      await fetchCart();
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    await fetchCart();
  };

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId);
    await api.patch(`/cart/${itemId}`, { quantity });
    await fetchCart();
  };

  const clearCart = () => setItems([]);

  const total     = items.reduce((s, i) => s + (i.sale_price || i.price) * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, total, itemCount, isOpen, loading,
      setIsOpen, addItem, removeItem, updateQty, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
