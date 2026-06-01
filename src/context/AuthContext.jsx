import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../api/authService';

export const AuthContext = createContext();

const API_BASE_URL = 'https://backend-qr-code-u2kx.onrender.com';

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
  // Token considéré expiré seulement s'il ne reste VRAIMENT plus rien (pas de buffer agressif)
  return payload.exp * 1000 < Date.now();
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

  const keepAliveRef = useRef(null);

  // ── Keep-Alive : utilise fetch NATIF (bypass les intercepteurs axios)
  // Cela évite que le ping ne déclenche une déconnexion accidentelle en cas d'erreur 401
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = setInterval(async () => {
      const tkn = localStorage.getItem('payqr_token');
      if (!tkn) {
        clearInterval(keepAliveRef.current);
        return;
      }
      try {
        // fetch natif : les intercepteurs axios ne s'appliquent PAS ici
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tkn}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // timeout 10s max
        });
        if (res.ok) {
          console.debug('[KeepAlive] ✅ Ping serveur OK');
        } else {
          console.debug(`[KeepAlive] ⚠️ Ping réponse ${res.status} (ignoré)`);
        }
      } catch (err) {
        // Serveur en veille ou réseau coupé — on ignore silencieusement
        console.debug('[KeepAlive] ⏳ Ping ignoré (serveur indisponible)');
      }
    }, 3 * 60 * 1000); // toutes les 3 minutes
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadUser();
      startKeepAlive();
    } else {
      setLoading(false);
      stopKeepAlive();
    }
    return () => {
      stopKeepAlive();
    };
  }, [token]); // eslint-disable-line

  const loadUser = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('payqr_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setLoading(false);
        return;
      }

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
    stopKeepAlive();
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
