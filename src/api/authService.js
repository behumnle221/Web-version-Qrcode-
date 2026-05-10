import api from './axios';

// Normalize backend user data to frontend format
function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    role: user.role, // Backend now uses 'role' consistently
  };
}

export const authService = {
  async login(email, password) {
    console.log('[authService.login] Attempting login for email:', email);
    try {
      const response = await api.post('/api/auth/login', { emailOrPhone: email, password });
      console.log('[authService.login] Response received:', response);
      
      // Backend returns: { success: true, message: "...", data: { token, role, ... } }
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        const token = responseData.data.token;
        const user = normalizeUser(responseData.data);
        console.log('[authService.login] Processed data. Token exists:', !!token, 'User:', user);
        return { token, user };
      }
      throw new Error(responseData.message || 'Erreur de connexion');
    } catch (error) {
      console.error('[authService.login] Error during login:', error);
      throw error;
    }
  },

  async registerClient(data) {
    const response = await api.post('/api/auth/register/client', data);
    return response.data;
  },

  async registerVendeur(data) {
    const response = await api.post('/api/auth/register/vendeur', data);
    return response.data;
  },

  async getCurrentUser() {
    // Note: /api/auth/me is not available. 
    // In a real app, we might call a role-specific profile endpoint.
    // For now, we return null to let AuthContext use localStorage.
    return null;
  },

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(code, newPassword) {
    const response = await api.post('/api/auth/reset-password', { code, newPassword });
    return response.data;
  },
};

  