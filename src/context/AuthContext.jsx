import { createContext, useState, useEffect, useCallback, useRef } from 'react';
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
  // Buffer de 30s : on considère le token expiré 30s AVANT sa vraie expiration
  return payload.exp * 1000 < Date.now() + 30000;
}

// Retourne le nombre de ms restantes avant expiration (0 si déjà expiré)
function getTokenRemainingMs(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return 0;
  const remaining = payload.exp * 1000 - Date.now() - 30000; // 30s de marge
  return Math.max(0, remaining);
}

// ── AuthProvider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('payqr_token');
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('payqr_token');
      localStorage.removeItem('payqr_user');
      return null;
    }
    return stored;
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('payqr_token');
    if (storedToken && isTokenExpired(storedToken)) return null;
    const stored = localStorage.getItem('payqr_user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    const t = localStorage.getItem('payqr_token');
    const u = localStorage.getItem('payqr_user');
    if (t && !isTokenExpired(t) && !u) return true; 
    return false;
  });
  const logoutTimerRef = useRef(null);

  // Démarre un timer pour déconnecter automatiquement avant l'expiration du token
  const scheduleAutoLogout = useCallback((tkn) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    const remaining = getTokenRemainingMs(tkn);
    if (remaining <= 0) {
      logout();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      console.warn('[Auth] Token expiré — déconnexion automatique');
      logout();
    }, remaining);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (token) {
      loadUser();
      scheduleAutoLogout(token);
    } else {
      setLoading(false);
    }
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
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
    scheduleAutoLogout(newToken);
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
