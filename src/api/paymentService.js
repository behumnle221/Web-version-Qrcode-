import api from './axios';

export const paymentService = {
  async initiatePayment(data) {
    const response = await api.post('/api/payments/initiate', data);
    return response.data;
  },

  async virtualPayment(data) {
    const response = await api.post('/api/payments/virtual', data);
    return response.data;
  },

  async getPaymentStatus(transactionId) {
    const response = await api.get(`/api/payments/status/${transactionId}`);
    return response.data;
  },

  async getLocalStatus(transactionId) {
    const response = await api.get(`/api/payments/status/local/${transactionId}`);
    return response.data;
  },
};
