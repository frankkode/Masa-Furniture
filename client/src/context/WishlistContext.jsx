import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading,     setLoading]     = useState(false);

  // load wishlist product ids whenever user changes
  const refresh = useCallback(async () => {
    if (!user) { setWishlistIds(new Set()); return; }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      const ids = (res.data.items || []).map(i => i.product_id);
      setWishlistIds(new Set(ids));
    } catch {
      setWishlistIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (productId) => {
    if (!user) return false; // caller should redirect to login
    const id = Number(productId);
    if (wishlistIds.has(id)) {
      // optimistic remove
      setWishlistIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      try { await api.delete(`/wishlist/${id}`); }
      catch { setWishlistIds(prev => new Set([...prev, id])); } // rollback
    } else {
      // optimistic add
      setWishlistIds(prev => new Set([...prev, id]));
      try { await api.post(`/wishlist/${id}`); }
      catch (err) {
        if (err.response?.status !== 409) {
          setWishlistIds(prev => { const s = new Set(prev); s.delete(id); return s; }); // rollback
        }
      }
    }
    return true;
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, refresh, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
