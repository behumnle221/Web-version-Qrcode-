import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, XCircle, Code, RefreshCw, CreditCard, Smartphone, Wallet, Store, Mail, Lock } from 'lucide-react';
import { paymentService } from '../../api/paymentService';
import { qrCodeService } from '../../api/qrCodeService';
import { clientService } from '../../api/clientService';
import { vendeurService } from '../../api/vendeurService';
import { authService } from '../../api/authService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function TestApiPage() {
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [formData, setFormData] = useState({
    // Payment
    qrCodeId: '',
    telephoneClient: '',
    operator: 'Orange_Cameroon',
    montant: '',
    // QR
    description: '',
    dateExpiration: '',
    // Auth
    email: '',
    password: '',
  });

  const tabs = [
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'qr', label: 'QR Codes', icon: Code },
    { id: 'auth', label: 'Authentication', icon: RefreshCw },
    { id: 'client', label: 'Client', icon: Wallet },
    { id: 'vendeur', label: 'Vendeur', icon: Store },
  ];

  const runTest = async (apiCall, label) => {
    setLoading(true);
    setResponse(null);
    try {
      const result = await apiCall;
      setResponse({ success: true, label, data: result });
      toast.success(`${label} réussi !`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setResponse({ success: false, label, error: errorMsg });
      toast.error(`${label} échoué`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = () => {
    if (!formData.qrCodeId || !formData.montant) return toast.error('QR ID et montant requis');
    runTest(
      paymentService.initiatePayment({
        qrCodeId: Number(formData.qrCodeId),
        telephoneClient: formData.telephoneClient,
        operator: formData.operator,
        montant: Number(formData.montant),
        directPayment: true,
        transactionType: 'PAYMENT_MARCHAND',
      }),
      'Initier Paiement'
    );
  };

  const handleValidateQR = () => {
    if (!formData.qrCodeId) return toast.error('QR ID requis');
    runTest(
      qrCodeService.validate(Number(formData.qrCodeId)),
      'Valider QR'
    );
  };

  const handleLogin = () => {
    if (!formData.email || !formData.password) return toast.error('Email et mot de passe requis');
    runTest(
      authService.login(formData.email, formData.password),
      'Connexion'
    );
  };

  const handleGetBalance = () => {
    runTest(
      clientService.getBalance(),
      'Solde Client'
    );
  };

  const handleGetVendeurBalance = () => {
    runTest(
      vendeurService.getBalance(),
      'Solde Vendeur'
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Test API
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
          Testez les endpoints de l'API en direct
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-surface-dark text-primary-600 shadow-xl'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Payment Tab */}
      {activeTab === 'payments' && (
        <Card className="animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Endpoints Paiements</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="QR Code ID"
                placeholder="ex: 1"
                value={formData.qrCodeId}
                onChange={(e) => setFormData({ ...formData, qrCodeId: e.target.value })}
                icon={Code}
              />
              <Input
                label="Montant (XAF)"
                placeholder="ex: 1000"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                icon={CreditCard}
              />
            </div>
            <Input
              label="Téléphone Client"
              placeholder="+237 6XX XXX XXX"
              value={formData.telephoneClient}
              onChange={(e) => setFormData({ ...formData, telephoneClient: e.target.value })}
              icon={Smartphone}
            />
            <div className="flex gap-3">
              <Button onClick={handleInitiatePayment} loading={loading} icon={Play}>
                Initier Paiement
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* QR Tab */}
      {activeTab === 'qr' && (
        <Card className="animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Endpoints QR Codes</h3>
          <div className="space-y-4">
            <Input
              label="QR Code ID"
              placeholder="ex: 1"
              value={formData.qrCodeId}
              onChange={(e) => setFormData({ ...formData, qrCodeId: e.target.value })}
              icon={Code}
            />
            <div className="flex gap-3">
              <Button onClick={handleValidateQR} loading={loading} icon={Play}>
                Valider QR
              </Button>
              <Button onClick={() => runTest(qrCodeService.getMyQrCodes(), 'Mes QR Codes')} loading={loading} variant="secondary">
                Mes QR Codes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Auth Tab */}
      {activeTab === 'auth' && (
        <Card className="animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Endpoints Authentication</h3>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={Mail}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              icon={Lock}
            />
            <div className="flex gap-3">
              <Button onClick={handleLogin} loading={loading} icon={Play}>
                Tester Connexion
              </Button>
              <Button onClick={() => runTest(authService.getCurrentUser(), 'Current User')} loading={loading} variant="secondary">
                Get Current User
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Client Tab */}
      {activeTab === 'client' && (
        <Card className="animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Endpoints Client</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGetBalance} loading={loading} icon={Wallet}>
              Get Balance
            </Button>
            <Button onClick={() => runTest(clientService.getTransactions(0, 10), 'Transactions')} loading={loading} variant="secondary">
              Transactions
            </Button>
            <Button onClick={() => runTest(clientService.getWithdrawals(0, 10), 'Retraits')} loading={loading} variant="secondary">
              Retraits
            </Button>
          </div>
        </Card>
      )}

      {/* Vendeur Tab */}
      {activeTab === 'vendeur' && (
        <Card className="animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Endpoints Vendeur</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGetVendeurBalance} loading={loading} icon={Wallet}>
              Get Balance
            </Button>
            <Button onClick={() => runTest(vendeurService.getTransactions(0, 10), 'Transactions')} loading={loading} variant="secondary">
              Transactions
            </Button>
            <Button onClick={() => runTest(vendeurService.getAangaraaBalance(), 'Solde Aangaraa')} loading={loading} variant="secondary">
              Solde Aangaraa
            </Button>
            <Button onClick={() => runTest(vendeurService.getWithdrawals(0, 10), 'Retraits')} loading={loading} variant="secondary">
              Retraits
            </Button>
          </div>
        </Card>
      )}

      {/* Response Display */}
      {response && (
        <Card className="animate-fade-in border-l-4 !border-primary-500">
          <div className="flex items-center gap-3 mb-4">
            {response.success ? (
              <CheckCircle size={24} className="text-success-500" />
            ) : (
              <XCircle size={24} className="text-danger-500" />
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {response.label}
            </span>
            <Badge status={response.success ? 'SUCCESS' : 'FAILED'} />
          </div>

          {response.success ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-danger-50 dark:bg-red-900/20 rounded-xl p-4">
              <p className="text-danger-700 dark:text-danger-400 font-mono text-sm">
                {response.error}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
