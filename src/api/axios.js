import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — inject JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('payqr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 & network errors ───────────────────────
let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    // 401 : token invalide ou expiré → déconnexion
    if (status === 401) {
      if (!isRedirectingToLogin && window.location.pathname !== '/login') {
        isRedirectingToLogin = true;
        localStorage.removeItem('payqr_token');
        localStorage.removeItem('payqr_user');
        setTimeout(() => {
          window.location.href = '/login';
          isRedirectingToLogin = false;
        }, 500);
      }
      return Promise.reject(error);
    }

    // 403 : accès refusé (ne pas rediriger vers login)
    if (status === 403) {
      console.warn(`[API 403] Accès refusé sur ${url}.`);
      error.isForbidden = true;
      return Promise.reject(error);
    }

    // 5xx ou erreur réseau : NE PAS déconnecter, laisser le composant gérer
    // Le serveur Render peut prendre du temps à se réveiller
    if (!status || status >= 500) {
      console.warn(`[API] Erreur serveur ou réseau (${status ?? 'timeout'}) sur ${url}. Le serveur est peut-être en cours de démarrage.`);
      error.isServerError = true;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
