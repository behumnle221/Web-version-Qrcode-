import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

export const AuthContext = createContext();

// ── JWT decoder (sans librairie externe) ─────────────────────────────────────
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  // Add 30s buffer
  return payload.exp * 1000 < Date.now() - 30000;
}

// ── AuthProvider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('payqr_token');
    // Clear immediately if expired
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('payqr_token');
      localStorage.removeItem('payqr_user');
      return null;
    }
    return stored;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line

  const loadUser = useCallback(async () => {
    try {
      // 1. Restore from localStorage immediately (no API call needed)
      const storedUser = localStorage.getItem('payqr_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setLoading(false);
        return;
      }

      // 2. Try to build user from JWT claims if localStorage is empty
      const currentToken = localStorage.getItem('payqr_token');
      if (currentToken) {
        const payload = decodeJwt(currentToken);
        if (payload) {
          const jwtUser = {
            userId: payload.userId,
            email: payload.sub,
            role: payload.role,
            nom: payload.nom,
          };
          setUser(jwtUser);
          localStorage.setItem('payqr_user', JSON.stringify(jwtUser));
        }
      }
    } catch (err) {
      console.error('loadUser error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const login = async (emailOrPhone, password) => {
    const { token: newToken, user: newUser } = await authService.login(emailOrPhone, password);
    localStorage.setItem('payqr_token', newToken);
    localStorage.setItem('payqr_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('payqr_token');
    localStorage.removeItem('payqr_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user && !isTokenExpired(token);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      login,
      logout,
      loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
