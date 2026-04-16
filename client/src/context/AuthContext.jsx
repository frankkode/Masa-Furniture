import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/* dispatch this after any auth state change so CartContext can re-sync */
function notifyAuthChange() {
  window.dispatchEvent(new Event('auth:change'));
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* restore session on mount */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data.user); notifyAuthChange(); })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    notifyAuthChange(); // ← triggers CartContext to re-fetch & merge guest cart
    return res.data.user;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    notifyAuthChange(); // ← merge any guest cart into the new account
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    notifyAuthChange(); // ← CartContext re-fetches (returns empty guest cart)
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
