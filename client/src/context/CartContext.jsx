import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]       = useState([]);
  const [isOpen, setIsOpen]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data.items || []);
    } catch {
      // guest cart stays empty until login
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const addItem = async (productId, quantity = 1) => {
    setLoading(true);
    await api.post('/cart', { product_id: productId, quantity });
    await fetchCart();
    setIsOpen(true);
    setLoading(false);
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

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, itemCount, isOpen, loading,
      setIsOpen, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
