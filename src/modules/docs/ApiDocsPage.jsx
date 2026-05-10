import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Code, Users, CreditCard, QrCode, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function ApiDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);

  const endpointCategories = [
    {
      title: 'Authentication',
      icon: Shield,
      color: 'blue',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/register/client',
          description: 'Créer un compte client',
          body: `{
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "password": "string"
}`,
          response: `{
  "id": 1,
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "userType": "CLIENT",
  "dateInscription": "2025-01-01T00:00:00"
}`,
        },
        {
          method: 'POST',
          path: '/api/auth/register/vendeur',
          description: 'Créer un compte vendeur',
          body: `{
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "password": "string",
  "nomCommerce": "string",
  "adresse": "string"
}`,
          response: `{
  "id": 1,
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "userType": "VENDEUR",
  "nomCommerce": "string",
  "adresse": "string"
}`,
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Connexion utilisateur',
          body: `{
  "email": "string",
  "password": "string"
}`,
          response: `{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nom": "string",
    "email": "string",
    "userType": "CLIENT|VENDEUR|ADMIN"
  }
}`,
        },
        {
          method: 'GET',
          path: '/api/auth/me',
          description: 'Obtenir l\'utilisateur connecté (Header: Authorization: Bearer {token})',
          response: `{
  "id": 1,
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "userType": "CLIENT|VENDEUR|ADMIN"
}`,
        },
        {
          method: 'POST',
          path: '/api/auth/forgot-password',
          description: 'Demander réinitialisation mot de passe',
          body: `{
  "email": "string"
}`,
          response: `{
  "message": "Code de réinitialisation envoyé"
}`,
        },
        {
          method: 'POST',
          path: '/api/auth/reset-password',
          description: 'Réinitialiser le mot de passe',
          body: `{
  "code": "string",
  "newPassword": "string"
}`,
          response: `{
  "message": "Mot de passe réinitialisé"
}`,
        },
      ],
    },
    {
      title: 'Payments',
      icon: CreditCard,
      color: 'green',
      endpoints: [
        {
          method: 'POST',
          path: '/api/payments/initiate',
          description: 'Initier un paiement via AangaraaPay (Public)',
          body: `{
  "qrCodeId": 1,
  "telephoneClient": "+2376XXXXXXXX",
  "operator": "Orange_Cameroon|MTN_Cameroon",
  "montant": 1000,
  "directPayment": true,
  "transactionType": "PAYMENT_MARCHAND"
}`,
          response: `{
  "success": true,
  "message": "Paiement initié avec succès",
  "transactionId": "string",
  "payUrl": "https://..."
}`,
        },
        {
          method: 'POST',
          path: '/api/payments/virtual',
          description: 'Paiement via solde virtuel (JWT required)',
          body: `{
  "qrCodeId": 1,
  "montant": 1000
}`,
          response: `{
  "success": true,
  "message": "Paiement effectué",
  "transactionId": "string"
}`,
        },
        {
          method: 'GET',
          path: '/api/payments/status/{transactionId}',
          description: 'Vérifier statut paiement auprès d\'AangaraaPay',
          response: `{
  "id": 1,
  "statut": "PENDING|SUCCESS|FAILED",
  "montant": 1000,
  "telephoneClient": "string",
  "operator": "string"
}`,
        },
        {
          method: 'GET',
          path: '/api/payments/status/local/{transactionId}',
          description: 'Vérifier statut transaction locale',
          response: `{
  "id": 1,
  "transactionId": "string",
  "statut": "PENDING|SUCCESS|FAILED",
  "montant": 1000,
  "dateCreation": "2025-01-01T00:00:00"
}`,
        },
      ],
    },
    {
      title: 'QR Codes',
      icon: QrCode,
      color: 'orange',
      endpoints: [
        {
          method: 'POST',
          path: '/api/qr/generate',
          description: 'Générer un QR code de paiement (VENDEUR required)',
          body: `{
  "products": [
    {
      "name": "string",
      "quantity": 1,
      "price": 1000
    }
  ],
  "description": "string",
  "dateExpiration": "2025-12-31T23:59:59"
}`,
          response: `{
  "id": 1,
  "contenu": "string",
  "qrPayload": "string",
  "qrCodeData": "string",
  "description": "string",
  "montant": 1000,
  "dateCreation": "2025-01-01T00:00:00",
  "estUtilise": false
}`,
        },
        {
          method: 'GET',
          path: '/api/qr/my-qrs',
          description: 'Lister les QR codes du vendeur (VENDEUR)',
          response: `[
  {
    "id": 1,
    "contenu": "string",
    "description": "string",
    "montant": 1000,
    "dateCreation": "string",
    "estUtilise": false
  }
]`,
        },
        {
          method: 'GET',
          path: '/api/qr/validate/{qrCodeId}',
          description: 'Valider un QR code (Public)',
          response: `{
  "valide": true,
  "montant": 1000,
  "description": "string",
  "vendeurNom": "string",
  "message": "string"
}`,
        },
        {
          method: 'PUT',
          path: '/api/qr/{id}/mark-used',
          description: 'Marquer QR comme utilisé (VENDEUR)',
          response: `{
  "message": "QR marqué comme utilisé"
}`,
        },
      ],
    },
    {
      title: 'Client Operations',
      icon: Users,
      color: 'purple',
      endpoints: [
        {
          method: 'GET',
          path: '/api/client/solde',
          description: 'Obtenir le solde virtuel (CLIENT)',
          response: `{
  "soldeVirtuel": 50000,
  "id": 1,
  "nom": "string"
}`,
        },
        {
          method: 'GET',
          path: '/api/client/transactions?page=0&size=10',
          description: 'Historique transactions client (CLIENT)',
          response: `{
    "content": [
      {
        "id": 1,
        "transactionId": "string",
        "montant": 1000,
        "statut": "SUCCESS|PENDING|FAILED",
        "transactionType": "PAYMENT_MARCHAND",
        "dateCreation": "2025-01-01T00:00:00",
        "message": "string"
      }
    ],
    "totalPages": 0,
    "totalElements": 0
  }`,
        },
        {
          method: 'POST',
          path: '/api/client/recharger',
          description: 'Recharger solde via AangaraaPay (CLIENT)',
          body: `{
  "montant": 10000,
  "operator": "Orange_Cameroon|MTN_Cameroon",
  "telephone": "+2376XXXXXXXX"
}`,
          response: `{
  "success": true,
  "message": "Rechargement initié"
}`,
        },
        {
          method: 'POST',
          path: '/api/client/retraits',
          description: 'Demander un retrait vers mobile money (CLIENT)',
          body: `{
  "montant": 5000,
  "operateur": "Orange_Cameroon|MTN_Cameroon",
  "telephone": "+2376XXXXXXXX"
}`,
          response: `{
  "id": 1,
  "montant": 5000,
  "statut": "PENDING",
  "referenceId": "string",
  "dateCreation": "2025-01-01T00:00:00"
}`,
        },
        {
          method: 'GET',
          path: '/api/client/retraits?page=0&size=10',
          description: 'Historique retraits client (CLIENT)',
          response: `{
    "content": [...],
    "totalPages": 0
  }`,
        },
        {
          method: 'POST',
          path: '/api/client/retraits/sync',
          description: 'Synchroniser statut retraits en attente (CLIENT)',
          response: `{
    "updated": 0,
    "failed": 0,
    "message": "Sync terminé"
  }`,
        },
      ],
    },
    {
      title: 'Vendeur Operations',
      icon: Store,
      color: 'pink',
      endpoints: [
        {
          method: 'GET',
          path: '/api/vendeur/solde',
          description: 'Obtenir le solde vendeur (VENDEUR)',
          response: `{
  "soldeVirtuel": 150000,
  "id": 1,
  "nomCommerce": "string"
}`,
        },
        {
          method: 'GET',
          path: '/api/vendeur/transactions?page=0&size=10',
          description: 'Historique transactions vendeur (VENDEUR)',
          response: `{
    "content": [...],
    "totalPages": 0
  }`,
        },
        {
          method: 'GET',
          path: '/api/vendeur/solde-aangaraa',
          description: 'Obtenir solde réel AangaraaPay (VENDEUR)',
          response: `{
  "soldeReel": 200000,
  "devise": "XAF"
}`,
        },
        {
          method: 'POST',
          path: '/api/vendeur/retraits',
          description: 'Demander un retrait (VENDEUR)',
          body: `{
  "montant": 10000,
  "operateur": "Orange_Cameroon|MTN_Cameroon",
  "telephone": "+2376XXXXXXXX"
}`,
          response: `{
  "id": 1,
  "montant": 10000,
  "statut": "PENDING",
  "referenceId": "string"
}`,
        },
        {
          method: 'POST',
          path: '/api/vendeur/retraits/sync',
          description: 'Synchroniser tous les retraits en attente (VENDEUR)',
          response: `{
    "total": 5,
    "success": 5,
    "failed": 0
  }`,
        },
        {
          method: 'POST',
          path: '/api/vendeur/verify-phone',
          description: 'Vérifier un numéro sur AangaraaPay (VENDEUR)',
          body: `{
  "telephone": "+2376XXXXXXXX"
}`,
          response: `{
  "valid": true,
  "message": "Numéro valide"
}`,
        },
        {
          method: 'GET',
          path: '/api/vendeur/transactions/export-csv',
          description: 'Exporter transactions en CSV (VENDEUR)',
          response: `CSV file download`,
        },
      ],
    },
    {
      title: 'Webhooks',
      icon: Code,
      color: 'yellow',
      endpoints: [
        {
          method: 'POST',
          path: '/api/webhook/aangaraa',
          description: 'Webhook AangaraaPay (Public - Called by AangaraaPay)',
          body: `{
  "payToken": "string",
  "transactionId": "string",
  "status": "SUCCESS|FAILED|PENDING",
  "operator": "Orange_Cameroon|MTN_Cameroon",
  "montant": 1000,
  "telephone": "+2376XXXXXXXX",
  "date": "2025-01-01T00:00:00"
}`,
          response: `{
  "received": true,
  "processed": true
}`,
        },
      ],
    },
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-success-100 text-success-700 dark:bg-green-900/30';
      case 'POST': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30';
      case 'PUT': return 'bg-warning-100 text-warning-700 dark:bg-yellow-900/30';
      case 'DELETE': return 'bg-danger-100 text-danger-700 dark:bg-red-900/30';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-success-100 text-success-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700',
      pink: 'bg-pink-100 text-pink-700',
      yellow: 'bg-yellow-100 text-yellow-700',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Documentation API
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
          Référence complète des endpoints PayQr
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!border-primary-200 dark:!border-primary-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
              <Book size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Base URL</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">
                {import.meta.env.VITE_API_URL || 'https://backend-qr-code-u2kx.onrender.com'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="!border-success-200 dark:!border-green-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <Code size={24} className="text-success-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Format</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">JSON</p>
            </div>
          </div>
        </Card>
        <Card className="!border-orange-200 dark:!border-orange-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">Auth</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">JWT Bearer Token</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Endpoint Categories */}
      {endpointCategories.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorClasses(category.color)}`}>
                <Icon size={20} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {category.title}
              </h2>
            </div>

            <div className="space-y-3">
              {category.endpoints.map((endpoint, idx) => (
                <Card
                  key={idx}
                  className={`transition-all duration-200 cursor-pointer ${
                    expandedEndpoint === idx ? '!border-primary-500 shadow-lg' : ''
                  } hover:border-primary-300 dark:hover:border-primary-700`}
                  onClick={() => setExpandedEndpoint(expandedEndpoint === idx ? null : idx)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {endpoint.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className={`text-gray-400 transition-transform duration-200 ${
                        expandedEndpoint === idx ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded Details */}
                  {expandedEndpoint === idx && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-6 animate-fade-in">
                      {/* Request Body */}
                      {endpoint.body && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Code size={16} />
                            Request Body
                          </h4>
                          <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
                            {endpoint.body}
                          </pre>
                        </div>
                      )}

                      {/* Response */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <CheckCircle size={16} className="text-success-500" />
                          Response
                        </h4>
                        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
                          {endpoint.response}
                        </pre>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick Start */}
      <Card className="!border-primary-200 dark:!border-primary-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ExternalLink size={24} className="text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Tester l'API
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Utilisez la page de test interactive pour expérimenter les endpoints en temps réel.
            </p>
            <Link to="/test-api">
              <Button icon={Play}>Aller à la page de test</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
