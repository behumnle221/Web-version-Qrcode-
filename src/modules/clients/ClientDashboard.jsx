import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpDown, RefreshCw } from 'lucide-react';
import { clientService } from '../../api/clientService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OPERATORS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeForm, setRechargeForm] = useState({ montant: '', operator: 'Orange_Cameroon', telephone: '' });
  const [recharging, setRecharging] = useState(false);

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    try {
      const [bal, tx] = await Promise.allSettled([
        clientService.getBalance(),
        clientService.getTransactions(page, 10),
      ]);
      if (bal.status === 'fulfilled') setBalance(typeof bal.value === 'number' ? bal.value : bal.value?.data || 0);
      if (tx.status === 'fulfilled') {
        const txResult = tx.value || {};
        const items = Array.isArray(txResult.items) ? txResult.items : [];
        setTransactions(items);
        setTotalPages(txResult.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!rechargeForm.montant || !rechargeForm.telephone) return toast.error('Remplissez tous les champs');
    setRecharging(true);
    try {
      await clientService.recharge(rechargeForm);
      toast.success('Recharge initiée !');
      setShowRecharge(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de recharge');
    } finally {
      setRecharging(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Espace Client</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre solde et consultez votre historique</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => setShowRecharge(true)}>
          Recharger
        </Button>
      </div>

      {/* Balance */}
      <Card className="gradient-primary text-white !border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200 font-medium">Solde Disponible</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(balance)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
            <Wallet size={32} />
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card padding={false}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Historique des Transactions</h3>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadData}>Actualiser</Button>
        </div>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Montant</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Statut</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((tx, i) => (
                  <tr key={tx.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                          <ArrowUpDown size={16} className="text-primary-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{tx.description || 'Transaction'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(tx.montant)}</td>
                    <td className="px-6 py-4"><Badge status={tx.statut} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.dateCreation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Aucune transaction" message="Vos transactions apparaîtront ici" />
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Précédent</Button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Suivant</Button>
          </div>
        )}
      </Card>

      {/* Recharge Modal */}
      <Modal isOpen={showRecharge} onClose={() => setShowRecharge(false)} title="Recharger mon compte">
        <form onSubmit={handleRecharge} className="space-y-4">
          <Input
            id="recharge-montant"
            label="Montant (XAF)"
            type="number"
            placeholder="1000"
            value={rechargeForm.montant}
            onChange={(e) => setRechargeForm({ ...rechargeForm, montant: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opérateur</label>
            <div className="flex gap-3">
              {OPERATORS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setRechargeForm({ ...rechargeForm, operator: op.value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    rechargeForm.operator === op.value
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
            id="recharge-tel"
            label="Téléphone"
            placeholder="+237 6XX XXX XXX"
            value={rechargeForm.telephone}
            onChange={(e) => setRechargeForm({ ...rechargeForm, telephone: e.target.value })}
          />
          <Button type="submit" fullWidth loading={recharging}>Recharger</Button>
        </form>
      </Modal>
    </div>
  );
}
