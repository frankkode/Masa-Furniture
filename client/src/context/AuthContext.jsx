import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function notifyAuthChange() {
  window.dispatchEvent(new Event('auth:change'));
}

/* Helpers — keep user in localStorage so refresh is instant */
const USER_KEY = 'masa_user';
const saveUser  = u  => u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY);
const loadUser  = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };

export function AuthProvider({ children }) {
  // Seed state immediately from localStorage — no flash of "logged out"
  const [user,    setUser]    = useState(() => loadUser());
  const [loading, setLoading] = useState(true);

  /* On mount: verify the stored token is still valid */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          saveUser(res.data.user);
          notifyAuthChange();
        })
        .catch(() => {
          // Token expired / invalid → clear everything
          localStorage.removeItem('token');
          saveUser(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      saveUser(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    saveUser(res.data.user);
    notifyAuthChange();
    return res.data.user;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    saveUser(res.data.user);
    notifyAuthChange();
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    saveUser(null);
    setUser(null);
    notifyAuthChange();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
