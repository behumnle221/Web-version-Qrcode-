import api from './axios';

export const notificationService = {
  async getNotifications(page = 0, size = 10) {
    const response = await api.get(`/api/notification?page=${page}&size=${size}`);
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await api.put(`/api/notification/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/api/notification/read-all');
    return response.data;
  },

  async sendTestNotification() {
    const response = await api.post('/api/notification/send');
    return response.data;
  },
};
