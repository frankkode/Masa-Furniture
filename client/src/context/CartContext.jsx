import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const CartContext = createContext(null);

// Persist cart items in localStorage so a page refresh never shows
// an empty cart while the API re-fetches.  The server DB is still
// the source of truth — this is just a display cache.
const CART_CACHE_KEY = 'masa_cart_items';
const loadCachedItems = () => {
  try { return JSON.parse(localStorage.getItem(CART_CACHE_KEY)) || []; }
  catch { return []; }
};
const cacheItems = (items) => localStorage.setItem(CART_CACHE_KEY, JSON.stringify(items));

export function CartProvider({ children }) {
  const cached = loadCachedItems();
  const [items,   setItems]   = useState(cached);
  const [isOpen,  setIsOpen]  = useState(false);
  const [loading, setLoading] = useState(false);
  // True until the first server fetch completes.  While true the
  // cart page shows a spinner instead of "Your cart is empty".
  const [hydrated, setHydrated] = useState(cached.length > 0);

  // Keep localStorage in sync whenever items change
  useEffect(() => { cacheItems(items); }, [items]);

  /* fetchCart — syncs with server, falls back to cached items on error */
  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data.items || []);
    } catch {
      // API unreachable — keep the cached items so the cart
      // doesn't flash empty on slow connections or cold-starts.
    } finally {
      setHydrated(true);
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

  const clearCart = () => { setItems([]); cacheItems([]); };

  const total     = items.reduce((s, i) => s + (i.sale_price || i.price) * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, total, itemCount, isOpen, loading, hydrated,
      setIsOpen, addItem, removeItem, updateQty, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
