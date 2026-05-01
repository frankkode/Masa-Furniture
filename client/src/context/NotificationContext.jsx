/**
 * NotificationContext
 * Polls /api/notifications every 30 s while the user is logged in.
 * Exposes: { notifications, unread, markRead, markAllRead, remove, refresh }
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread,        setUnread]        = useState(0);
  const intervalRef = useRef(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {
      /* ignore — network errors shouldn't break the app */
    }
  }, [user]);

  /* start polling when logged in, stop when logged out */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnread(0);
      clearInterval(intervalRef.current);
      return;
    }
    fetch(); // immediate first load
    intervalRef.current = setInterval(fetch, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [user, fetch]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnread(0);
    } catch { /* ignore */ }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const removed = prev.find(n => n.id === id);
        if (removed && !removed.is_read) setUnread(u => Math.max(0, u - 1));
        return prev.filter(n => n.id !== id);
      });
    } catch { /* ignore */ }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unread, markRead, markAllRead, remove, refresh: fetch }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
