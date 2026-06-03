import api from './axios';

// ── helpers ──────────────────────────────────────────────────────────────────
function unwrap(response) {
  // Backend: { success, message, data: { ... } }
  const res = response.data;
  if (res && res.success !== undefined) return res.data ?? res;
  return res ?? response;
}

function extractList(response) {
  const data = unwrap(response);
  const items = data.content ?? data.items ?? (Array.isArray(data) ? data : []);
  return {
    items,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? items.length,
    currentPage: data.currentPage ?? 0,
  };
}

// ── vendeurService ────────────────────────────────────────────────────────────
export const vendeurService = {

  // SOLDE
  async getSolde() {
    const response = await api.get('/api/vendeur/solde');
    const data = unwrap(response);
    return {
      solde: data.solde ?? data.soldeVirtuel ?? 0,
      devise: data.devise ?? 'XAF',
      derniereMiseAJour: data.derniereMiseAJour ?? null,
    };
  },

  async recalculerSolde() {
    const response = await api.put('/api/vendeur/recalculer-solde');
    return unwrap(response);
  },

  async getSoldeAangaraa() {
    const response = await api.get('/api/vendeur/solde-aangaraa');
    return unwrap(response);
  },

  // TRANSACTIONS
  async getTransactions({ page = 0, size = 10, statut = null, dateDebut = null, dateFin = null } = {}) {
    const params = new URLSearchParams({ page, size });
    if (statut)    params.append('statut', statut);
    // Backend attend LocalDateTime format: 2026-01-01T00:00:00 (sans Z ni ms)
    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin)   params.append('dateFin', dateFin);
    const response = await api.get(`/api/vendeur/transactions?${params}`);
    const data = unwrap(response);
    // TransactionListResponse: { content, totalElements, totalPages, currentPage, ... }
    const items = (data?.content ?? []).map(tx => ({
      id:            tx.id,
      transactionId: tx.transactionId ?? tx.referenceId,
      montant:       tx.montant ?? tx.amount,
      statut:        tx.statut ?? tx.status,
      dateCreation:  tx.dateCreation ?? tx.createdAt,
      description:   tx.message ?? tx.description ?? tx.type ?? 'Paiement QR',
      type:          tx.transactionType ?? tx.type,
    }));
    return {
      items,
      totalPages:    data?.totalPages    ?? 0,
      totalElements: data?.totalElements ?? items.length,
      currentPage:   data?.currentPage   ?? 0,
    };
  },

  async exportCsv() {
    const response = await api.get('/api/vendeur/transactions/export-csv', { responseType: 'blob' });
    return response.data;
  },

  // RETRAITS
  async demanderRetrait({ montant, operateur, telephone }) {
    const response = await api.post('/api/vendeur/retraits', { montant, operateur, telephone });
    return unwrap(response);
  },

  async getRetraits({ page = 0, size = 10 } = {}) {
    const response = await api.get(`/api/vendeur/retraits?page=${page}&size=${size}`);
    return extractList(response);
  },

  async verifyPhone({ telephone, operateur }) {
    const response = await api.post('/api/vendeur/verify-phone', { telephone, operateur });
    return unwrap(response);
  },

  async getRetraitStatut(transactionId, operateur) {
    const response = await api.get(`/api/vendeur/retraits/${transactionId}/statut?operateur=${operateur}`);
    return unwrap(response);
  },

  async syncRetraits() {
    const response = await api.post('/api/vendeur/retraits/sync');
    return unwrap(response);
  },

  // === GESTION DES CAISSES ===
  async getCaisses() {
    const response = await api.get('/api/vendeur/caissiers');
    const d = response.data;
    // unwrap: { success, data: [...] }
    return Array.isArray(d) ? d : (d?.data ?? []);
  },

  async createCaisse(data) {
    const response = await api.post('/api/vendeur/caissiers', data);
    return response.data;
  },

  async toggleCaisse(id) {
    const response = await api.put(`/api/vendeur/caissiers/${id}/toggle`);
    return response.data;
  },

  async deleteCaisse(id) {
    const response = await api.delete(`/api/vendeur/caissiers/${id}`);
    return response.data;
  },

  // === CAISSIER: ses propres QR codes ===
  async getMesQrCodes() {
    const response = await api.get('/api/qr/my-qrs');
    const d = response.data;
    return Array.isArray(d) ? d : (d?.data ?? []);
  },

  // Compatibility aliases
  async getBalance() { return (await this.getSolde()).solde; },
  async requestWithdrawal(data) { return this.demanderRetrait(data); },
  async getWithdrawals(page, size) { return this.getRetraits({ page, size }); },
};

