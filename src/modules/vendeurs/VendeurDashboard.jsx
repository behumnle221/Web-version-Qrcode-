import { useState, useEffect } from 'react';
import { Store, Wallet, QrCode, ArrowUpDown, RefreshCw, Download, Plus } from 'lucide-react';
import { vendeurService } from '../../api/vendeurService';
import { qrCodeService } from '../../api/qrCodeService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OPERATORS } from '../../utils/constants';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VendeurDashboard() {
  const [balance, setBalance] = useState(0);
  const [qrCodes, setQrCodes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ montant: '', operateur: 'Orange_Cameroon', telephone: '' });
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [bal, qrs, tx] = await Promise.allSettled([
        vendeurService.getBalance(),
        qrCodeService.getMyQrCodes(),
        vendeurService.getTransactions(0, 5),
      ]);
      if (bal.status === 'fulfilled') setBalance(typeof bal.value === 'number' ? bal.value : bal.value?.data || 0);
      if (qrs.status === 'fulfilled') {
        const qrData = qrs.value || [];
        setQrCodes(Array.isArray(qrData) ? qrData : []);
      }
      if (tx.status === 'fulfilled') {
        const txResult = tx.value || {};
        const items = Array.isArray(txResult.items) ? txResult.items : [];
        setTransactions(items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawForm.montant || !withdrawForm.telephone) return toast.error('Remplissez tous les champs');
    setWithdrawing(true);
    try {
      await vendeurService.requestWithdrawal(withdrawForm);
      toast.success('Retrait demandé avec succès !');
      setShowWithdraw(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de retrait');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <PageLoader />;

  const activeQrs = qrCodes.filter(q => !q.estUtilise);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Commerce</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos QR codes et suivez vos ventes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Download} onClick={() => setShowWithdraw(true)}>Retirer</Button>
          <Link to="/vendeurs/generate-qr">
            <Button icon={Plus}>Nouveau QR</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Solde" value={formatCurrency(balance)} icon={Wallet} color="primary" />
        <StatCard title="QR Codes Actifs" value={activeQrs.length.toString()} icon={QrCode} color="orange" />
        <StatCard title="Ventes" value={transactions.length.toString()} icon={ArrowUpDown} color="success" />
      </div>

      {/* Balance Card */}
      <Card className="gradient-orange text-white !border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-100 font-medium">Solde du Commerce</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(balance)}</p>
            <p className="text-xs text-orange-200 mt-2">Retirez vos fonds via Orange Money ou MTN MoMo</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
            <Store size={32} />
          </div>
        </div>
      </Card>

      {/* QR Codes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mes QR Codes</h3>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadData}>Actualiser</Button>
        </div>
        {qrCodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrCodes.slice(0, 6).map((qr, i) => (
              <Card key={qr.id || i} hover>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <QrCode size={20} className="text-primary-500" />
                  </div>
                  <Badge status={qr.estUtilise ? 'EXPIRED' : 'ACTIVE'} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{qr.description || 'QR Code'}</p>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(qr.montant)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDate(qr.dateCreation)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun QR Code"
            message="Créez votre premier QR code pour commencer à recevoir des paiements"
            icon={QrCode}
            action={
              <Link to="/vendeurs/generate-qr">
                <Button icon={Plus}>Créer un QR Code</Button>
              </Link>
            }
          />
        )}
      </div>

      {/* Withdrawal Modal */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Retirer des fonds">
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-2">
            <p className="text-sm text-primary-700 dark:text-primary-300">Solde disponible : <strong>{formatCurrency(balance)}</strong></p>
          </div>
          <Input
            id="withdraw-montant"
            label="Montant (XAF)"
            type="number"
            placeholder="1000"
            value={withdrawForm.montant}
            onChange={(e) => setWithdrawForm({ ...withdrawForm, montant: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opérateur</label>
            <div className="flex gap-3">
              {OPERATORS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setWithdrawForm({ ...withdrawForm, operateur: op.value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    withdrawForm.operateur === op.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: op.color }}>
                    {op.label[0]}
                  </div>
                  {op.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            id="withdraw-tel"
            label="Téléphone"
            placeholder="+237 6XX XXX XXX"
            value={withdrawForm.telephone}
            onChange={(e) => setWithdrawForm({ ...withdrawForm, telephone: e.target.value })}
          />
          <Button type="submit" fullWidth variant="orange" loading={withdrawing}>Demander le retrait</Button>
        </form>
      </Modal>
    </div>
  );
}
