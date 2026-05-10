export const API_BASE_URL = 'https://backend-qr-code-u2kx.onrender.com';

export const OPERATORS = [
  { value: 'Orange_Cameroon', label: 'Orange Money', color: '#EA580C' },
  { value: 'MTN_Cameroon', label: 'MTN MoMo', color: '#EAB308' },
];

export const TRANSACTION_STATUSES = {
  PENDING: { label: 'En attente', color: 'yellow' },
  SUCCESS: { label: 'Réussi', color: 'green' },
  SUCCESSFUL: { label: 'Réussi', color: 'green' },
  FAILED: { label: 'Échoué', color: 'red' },
  EXPIRED: { label: 'Expiré', color: 'gray' },
  CANCELLED: { label: 'Annulé', color: 'gray' },
};

export const TRANSACTION_TYPES = {
  PAYMENT_MARCHAND: 'Paiement Marchand',
  TRANSFERT_VIRTUEL: 'Transfert Virtuel',
  RECHARGEMENT: 'Rechargement',
  RETRAIT: 'Retrait',
};

export const USER_ROLES = {
  CLIENT: 'CLIENT',
  VENDEUR: 'VENDEUR',
  ADMIN: 'ADMIN',
};

export const NAV_ITEMS = {
  CLIENT: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/clients', label: 'Mon Espace', icon: 'Wallet' },
    { path: '/payments', label: 'Paiements', icon: 'CreditCard' },
  ],
  VENDEUR: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/vendeurs', label: 'Mon Commerce', icon: 'Store' },
    { path: '/vendeurs/generate-qr', label: 'Générer QR', icon: 'QrCode' },
    { path: '/payments', label: 'Paiements', icon: 'CreditCard' },
  ],
  ADMIN: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/clients', label: 'Clients', icon: 'Users' },
    { path: '/vendeurs', label: 'Vendeurs', icon: 'Store' },
    { path: '/payments', label: 'Paiements', icon: 'CreditCard' },
  ],
};
