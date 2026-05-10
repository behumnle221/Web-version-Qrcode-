import api from './axios';

function normalizeQR(qr) {
  if (!qr) return qr;
  return {
    ...qr,
    id: qr.id ?? qr.qrCodeId,
    qrCodeId: qr.id ?? qr.qrCodeId,
    qrCodeData: qr.qrPayload ?? qr.contenu ?? qr.qrCodeData,
    montant: qr.montant,
    description: qr.description,
    dateCreation: qr.dateCreation,
    dateExpiration: qr.dateExpiration,
    estUtilise: qr.estUtilise ?? false,
  };
}

// Unwrap ApiResponse: { success, message, data: [...] }
function unwrapApiResponse(response) {
  const res = response.data;
  if (res && typeof res === 'object' && 'success' in res) {
    return res.data;
  }
  return res;
}

export const qrCodeService = {

  // POST /api/qr/generate → hasRole("VENDEUR") = ROLE_VENDEUR ✅
  async generate(data) {
    const response = await api.post('/api/qr/generate', data);
    const raw = unwrapApiResponse(response);
    return normalizeQR(raw);
  },

  // GET /api/qr/my-qrs → hasAuthority('VENDEUR') ← BUG backend (manque ROLE_)
  // Workaround: Si 403, on retourne tableau vide et on affiche message clair
  async getMyQrCodes() {
    const response = await api.get('/api/qr/my-qrs');
    const raw = unwrapApiResponse(response);
    // La réponse peut être un tableau direct ou un objet { data: [...] }
    const items = Array.isArray(raw) ? raw : (raw?.content ?? raw?.items ?? []);
    return items.map(normalizeQR);
  },

  async validate(qrCodeId) {
    const response = await api.get(`/api/qr/validate/${qrCodeId}`);
    return unwrapApiResponse(response);
  },

  // PUT /api/qr/{id}/mark-used → correction de l'URL (backend: /{id}/mark-used)
  async markAsUsed(qrCodeId) {
    const response = await api.put(`/api/qr/${qrCodeId}/mark-used`);
    return unwrapApiResponse(response);
  },
};
