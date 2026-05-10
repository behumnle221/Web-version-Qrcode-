import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject JWT
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

// Response interceptor — handle 401 & 403
let isRedirectingToLogin = false; // Évite les redirections multiples

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    if (status === 401) {
      // Token expiré ou invalide → déconnexion propre
      if (!isRedirectingToLogin && window.location.pathname !== '/login') {
        isRedirectingToLogin = true;
        localStorage.removeItem('payqr_token');
        localStorage.removeItem('payqr_user');
        // Petit délai pour laisser un toast s'afficher si nécessaire
        setTimeout(() => {
          window.location.href = '/login';
          isRedirectingToLogin = false;
        }, 100);
      }
    } else if (status === 403) {
      // Bug connu backend : QRCodeController utilise hasAuthority('VENDEUR') sans ROLE_
      // Ne pas rediriger, laisser le composant gérer l'erreur
      console.warn(`[API 403] Accès refusé sur ${url}. Vérifiez les autorités côté backend.`);
      error.isForbidden = true;
    }
    return Promise.reject(error);
  }
);

export default api;
