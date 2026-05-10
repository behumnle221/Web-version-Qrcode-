import api from './axios';

function extractBalance(response) {
  const data = response.data || response;
  // Backend returns Client entity with soldeVirtuel
  return data.soldeVirtuel ?? data.balance ?? data ?? 0;
}

function extractTransactions(response) {
  const data = response.data || response;
  const items = (data.content || data).map(tx => ({
    id: tx.id,
    transactionId: tx.transactionId,
    montant: tx.montant,
    statut: tx.statut,
    dateCreation: tx.dateCreation,
    description: tx.message || tx.description || 'Transaction',
    type: tx.transactionType,
  }));
  const totalPages = data.totalPages || 0;
  return { items, totalPages };
}

export const clientService = {
  async getBalance() {
    const response = await api.get('/api/client/solde');
    return extractBalance(response);
  },

  async getTransactions(page = 0, size = 10) {
    const response = await api.get(`/api/client/transactions?page=${page}&size=${size}`);
    return extractTransactions(response);
  },

  async recharge(data) {
    const response = await api.post('/api/client/recharger', data);
    return response.data;
  },

  async getWithdrawals(page = 0, size = 10) {
    const response = await api.get(`/api/client/retraits?page=${page}&size=${size}`);
    return extractTransactions(response);
  },

  async requestWithdrawal(data) {
    const response = await api.post('/api/client/retraits', data);
    return response.data;
  },

  async syncWithdrawals() {
    const response = await api.post('/api/client/retraits/sync');
    return response.data;
  },

  async getWithdrawalStatus(transactionId, operateur) {
    const response = await api.get(`/api/client/retraits/${transactionId}/statut?operateur=${operateur}`);
    return response.data;
  },
};
