import { useState, useEffect } from 'react';
import { Wallet, QrCode, ArrowUpDown, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { clientService } from '../../api/clientService';
import { vendeurService } from '../../api/vendeurService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

// Mock chart data — will be replaced by real API data
const mockChartData = [
  { name: 'Lun', montant: 4200 },
  { name: 'Mar', montant: 3100 },
  { name: 'Mer', montant: 5800 },
  { name: 'Jeu', montant: 4600 },
  { name: 'Ven', montant: 7200 },
  { name: 'Sam', montant: 8100 },
  { name: 'Dim', montant: 6500 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role || 'CLIENT';
  const isVendeur = role === 'VENDEUR';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const balanceService = isVendeur ? vendeurService : clientService;
      const txService = isVendeur ? vendeurService : clientService;

      const [bal, txRes] = await Promise.allSettled([
        balanceService.getBalance(),
        txService.getTransactions(0, 5),
      ]);

      if (bal.status === 'fulfilled') {
        setBalance(typeof bal.value === 'number' ? bal.value : bal.value?.data || 0);
      }
      if (txRes.status === 'fulfilled') {
        const txResult = txRes.value || {};
        const items = Array.isArray(txResult.items) ? txResult.items : [];
        setTransactions(items);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const successCount = transactions.filter(t => t.statut === 'SUCCESS' || t.statut === 'SUCCESSFUL').length;
  const successRate = transactions.length > 0 ? Math.round((successCount / transactions.length) * 100) : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour, {user?.nom || 'Utilisateur'} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Voici un aperçu de votre activité sur PayQr
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stagger-1 animate-fade-in">
          <StatCard
            title="Solde Disponible"
            value={formatCurrency(balance)}
            icon={Wallet}
            color="primary"
            trend="up"
            trendValue="+12% ce mois"
          />
        </div>
        <div className="stagger-2 animate-fade-in">
          <StatCard
            title="Transactions"
            value={transactions.length.toString()}
            icon={ArrowUpDown}
            color="orange"
            trend="up"
            trendValue="+5 aujourd'hui"
          />
        </div>
        <div className="stagger-3 animate-fade-in">
          <StatCard
            title={isVendeur ? 'QR Codes Créés' : 'Paiements Effectués'}
            value={successCount.toString()}
            icon={isVendeur ? QrCode : CheckCircle}
            color="success"
          />
        </div>
        <div className="stagger-4 animate-fade-in">
          <StatCard
            title="Taux de Succès"
            value={`${successRate}%`}
            icon={TrendingUp}
            color="yellow"
            trend={successRate >= 90 ? 'up' : 'down'}
            trendValue={successRate >= 90 ? 'Excellent' : 'À améliorer'}
          />
        </div>
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transactions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">7 derniers jours</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-success-500">
              <TrendingUp size={16} />
              +24%
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#1E293B' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: isDark ? '#E2E8F0' : '#1E293B', fontWeight: 600 }}
                  formatter={(value) => [`${value.toLocaleString()} XAF`, 'Montant']}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMontant)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent transactions */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Récentes</h3>
            <ArrowRight size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => (
              <div key={tx.id || i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.statut === 'SUCCESS' || tx.statut === 'SUCCESSFUL'
                      ? 'bg-success-50 dark:bg-green-900/30'
                      : 'bg-yellow-50 dark:bg-yellow-900/30'
                  }`}>
                    <ArrowUpDown size={18} className={
                      tx.statut === 'SUCCESS' || tx.statut === 'SUCCESSFUL'
                        ? 'text-success-500'
                        : 'text-yellow-500'
                    } />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.description || 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(tx.dateCreation)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(tx.montant)}
                  </p>
                  <Badge status={tx.statut} />
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune transaction récente</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
