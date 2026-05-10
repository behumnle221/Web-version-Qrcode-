import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { vendeurService } from '../../api/vendeurService';
import toast from 'react-hot-toast';
import {
  QrCode, RefreshCw, TrendingUp, ArrowDownToLine,
  Receipt, Bell, CheckCircle2, Clock, XCircle,
  ArrowRight, Zap, Store, ChevronRight, Wallet
} from 'lucide-react';

/* ── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .vh-root { animation: vh-fade-in 0.4s ease-out; }
  @keyframes vh-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .vh-greeting { margin-bottom: 1.75rem; }
  .vh-greeting-day { font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
  .vh-greeting-name {
    font-family: 'Sora', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #0f172a; letter-spacing: -0.02em;
  }
  .dark .vh-greeting-name { color: #f1f5f9; }

  /* ── SOLDE CARDS ── */
  .vh-balances {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (min-width: 768px) {
    .vh-balances { grid-template-columns: repeat(2, 1fr); }
  }

  .vh-bal-card {
    border-radius: 20px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  .vh-bal-card-primary {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
    color: #fff;
    box-shadow: 0 8px 32px rgba(37,99,235,.25);
  }
  .vh-bal-card-ops {
    background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
    color: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,.2);
  }

  .vh-bal-label {
    font-size: 12px; font-weight: 600;
    opacity: 0.75; text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 6px;
  }
  .vh-bal-amount {
    font-family: 'Sora', sans-serif;
    font-size: clamp(28px, 5vw, 38px); font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }
  .vh-bal-sub { font-size: 12px; opacity: 0.6; }

  .vh-bal-refresh {
    position: absolute; top: 1rem; right: 1rem;
    width: 32px; height: 32px;
    border-radius: 8px; border: none;
    background: rgba(255,255,255,0.1);
    cursor: pointer; color: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .vh-bal-refresh:hover { background: rgba(255,255,255,0.2); transform: rotate(180deg); }
  .vh-bal-refresh.spinning { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .vh-ops-grid { display: flex; gap: 1rem; margin-top: 0.5rem; }
  .vh-op-chip {
    flex: 1;
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.06);
    border-radius: 10px; padding: 0.6rem 0.75rem;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .vh-op-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .vh-op-name { font-size: 11px; font-weight: 600; opacity: 0.8; }
  .vh-op-val { font-size: 13px; font-weight: 700; margin-top: 1px; }

  /* ── QUICK ACTION ── */
  .vh-quick {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 18px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
    cursor: pointer; text-decoration: none;
    transition: all 0.25s;
    box-shadow: 0 8px 24px rgba(37,99,235,.3);
  }
  .vh-quick:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,99,235,.4); }
  .vh-quick-left { display: flex; align-items: center; gap: 14px; }
  .vh-quick-icon {
    width: 48px; height: 48px;
    background: rgba(255,255,255,0.15);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .vh-quick-title { font-size: 16px; font-weight: 700; color: #fff; }
  .vh-quick-sub { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px; }

  /* ── CHART ── */
  .vh-section-title {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 700;
    color: #0f172a; margin-bottom: 1rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark .vh-section-title { color: #f1f5f9; }

  .vh-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .dark .vh-card { background: #0f172a; border-color: #1e293b; }

  .vh-chart-wrap { height: 160px; display: flex; align-items: flex-end; gap: 8px; }
  .vh-bar-col {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .vh-bar {
    width: 100%; border-radius: 6px 6px 0 0;
    background: #2563eb;
    transition: all 0.6s ease-out;
    min-height: 4px;
  }
  .vh-bar.highlight { background: #1d4ed8; }
  .vh-bar-label { font-size: 10px; color: #94a3b8; font-weight: 500; }

  .vh-stats-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem; margin-top: 1rem;
  }
  .vh-stat-chip {
    background: #f8fafc; border-radius: 10px;
    padding: 0.75rem; text-align: center;
    border: 1px solid #e2e8f0;
  }
  .dark .vh-stat-chip { background: #1e293b; border-color: #334155; }
  .vh-stat-chip-val {
    font-family: 'Sora', sans-serif;
    font-size: 18px; font-weight: 800;
    color: #0f172a;
  }
  .dark .vh-stat-chip-val { color: #f1f5f9; }
  .vh-stat-chip-val span { color: #2563eb; }
  .vh-stat-chip-label { font-size: 11px; color: #64748b; margin-top: 2px; }

  /* ── RECENT TX ── */
  .vh-tx-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .dark .vh-tx-item { border-color: #1e293b; }
  .vh-tx-item:last-child { border-bottom: none; }
  .vh-tx-left { display: flex; align-items: center; gap: 10px; }
  .vh-tx-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .vh-tx-desc { font-size: 13px; font-weight: 600; color: #0f172a; }
  .dark .vh-tx-desc { color: #e2e8f0; }
  .vh-tx-date { font-size: 11px; color: #94a3b8; margin-top: 1px; }
  .vh-tx-amount { font-size: 14px; font-weight: 700; color: #0f172a; }
  .dark .vh-tx-amount { color: #f1f5f9; }
  .vh-tx-amount.success { color: #16a34a; }

  .vh-status-dot {
    display: inline-block;
    width: 6px; height: 6px; border-radius: 50%;
    margin-right: 4px;
  }

  .vh-empty {
    text-align: center; padding: 2rem;
    color: #94a3b8; font-size: 14px;
  }

  .vh-see-all {
    display: flex; align-items: center; justify-content: center;
    gap: 6px;
    padding: 0.75rem;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #2563eb; font-size: 13px; font-weight: 600;
    text-decoration: none; margin-top: 0.75rem;
    transition: all 0.15s;
  }
  .vh-see-all:hover { background: #eff6ff; }
  .dark .vh-see-all { background: #1e293b; border-color: #334155; }

  .vh-grid-2 {
    display: grid; grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  @media (min-width: 1024px) {
    .vh-grid-2 { grid-template-columns: 1.4fr 1fr; }
  }
`;

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_MAP = {
  SUCCESS:    { color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a', label: 'Réussi'    },
  SUCCESSFUL: { color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a', label: 'Réussi'    },
  PENDING:    { color: '#d97706', bg: '#fffbeb', dot: '#d97706', label: 'En attente' },
  FAILED:     { color: '#dc2626', bg: '#fef2f2', dot: '#dc2626', label: 'Échoué'    },
};

function aggregateData(txs, retraits, timeframe) {
  const now = new Date();
  const dataMap = new Map();
  let periods = [];
  let formatter;
  let getPeriodKey;

  if (timeframe === 'Semaine') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      periods.push(d);
    }
    formatter = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short' }) + '.';
    getPeriodKey = (d) => d.toISOString().split('T')[0];
  } else if (timeframe === 'Mois') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      periods.push(d);
    }
    formatter = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit' });
    getPeriodKey = (d) => d.toISOString().split('T')[0];
  } else if (timeframe === 'Année') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(d);
    }
    formatter = (d) => d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    getPeriodKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  periods.forEach(p => {
    dataMap.set(getPeriodKey(p), {
      name: formatter(p),
      'Paiements reçus': 0,
      Retraits: 0,
      sortKey: p.getTime()
    });
  });

  txs.forEach(tx => {
    if (tx.statut === 'SUCCESS' || tx.statut === 'SUCCESSFUL') {
      const d = new Date(tx.dateCreation);
      const key = getPeriodKey(d);
      if (dataMap.has(key)) {
        dataMap.get(key)['Paiements reçus'] += (tx.montant || 0);
      }
    }
  });

  retraits.forEach(rt => {
    if (rt.statut === 'SUCCESS' || rt.statut === 'SUCCESSFUL' || rt.statut === 'PENDING') {
      const d = new Date(rt.dateCreation);
      const key = getPeriodKey(d);
      if (dataMap.has(key)) {
        dataMap.get(key).Retraits += (rt.montant || 0);
      }
    }
  });

  return Array.from(dataMap.values()).sort((a, b) => a.sortKey - b.sortKey);
}

function StatsChart({ transactions, retraits }) {
  const [timeframe, setTimeframe] = useState('Mois');
  const data = useMemo(() => aggregateData(transactions, retraits, timeframe), [transactions, retraits, timeframe]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Statistiques</h3>
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '20px', padding: '4px' }}>
          {['Semaine', 'Mois', 'Année'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '16px',
                border: 'none',
                background: timeframe === tf ? '#2563eb' : 'transparent',
                color: timeframe === tf ? 'white' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: timeframe === tf ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={true} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10} 
              angle={timeframe === 'Mois' || timeframe === 'Année' ? -45 : 0} 
              textAnchor={timeframe === 'Mois' || timeframe === 'Année' ? 'end' : 'middle'} 
              height={60}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickFormatter={(value) => `${value} FCFA`}
            />
            <Tooltip 
              formatter={(value) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'}
              cursor={{fill: '#f1f5f9'}}
              contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
            />
            <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{paddingBottom: '20px'}} />
            <Bar dataKey="Paiements reçus" name="Paiements reçus" fill="#4ade80" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Retraits" name="Retraits" fill="#f87171" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function VendeurHome() {
  const { user } = useAuth();
  const [solde, setSolde] = useState(null);

  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, count: 0 });

  const [allTx, setAllTx] = useState([]);
  const [allRetraits, setAllRetraits] = useState([]);

  const loadAll = useCallback(async () => {
    try {
      const [soldeRes, allTxRes, allRetraitsRes] = await Promise.allSettled([
        vendeurService.getSolde(),
        vendeurService.getTransactions({ size: 1000 }),
        vendeurService.getRetraits({ size: 1000 })
      ]);

      if (soldeRes.status === 'fulfilled') setSolde(soldeRes.value);
      
      let items = [];
      if (allTxRes.status === 'fulfilled') {
        items = allTxRes.value.items || [];
        setAllTx(items);
        setRecentTx(items.slice(0, 5));
      }
      
      if (allRetraitsRes.status === 'fulfilled') {
        setAllRetraits(allRetraitsRes.value.items || []);
      }
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayTx = items.filter(tx =>
          tx.statut === 'SUCCESS' && new Date(tx.dateCreation) >= todayStart
        );
        setStats({
          total: items.reduce((s, t) => t.statut === 'SUCCESS' ? s + (t.montant || 0) : s, 0),
          today: todayTx.reduce((s, t) => s + (t.montant || 0), 0),
          count: items.length,
        });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRecalc = async () => {
    setRefreshing(true);
    try {
      // Récupère directement le solde stocké en base de données (pas de recalcul)
      const soldeRes = await vendeurService.getSolde();
      setSolde(soldeRes);
      toast.success('Solde mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour du solde');
    } finally {
      setRefreshing(false);
    }
  };

  const dayOfWeek = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const nomCommerce = user?.nomCommerce || user?.nom || 'Mon Commerce';

  return (
    <div className="vh-root">
      <style>{CSS}</style>

      {/* Greeting */}
      <div className="vh-greeting">
        <div className="vh-greeting-day">{dayOfWeek}, bonne journée 👋</div>
        <div className="vh-greeting-name">{nomCommerce}</div>
      </div>

      {/* Balance cards */}
      <div className="vh-balances">
        {/* Solde virtuel */}
        <div className="vh-bal-card vh-bal-card-primary">
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
          <button className={`vh-bal-refresh${refreshing ? ' spinning' : ''}`} onClick={handleRecalc} title="Recalculer">
            <RefreshCw size={14} />
          </button>
          <div className="vh-bal-label"><Wallet size={12} /> Solde Virtuel PayQr</div>
          <div className="vh-bal-amount">
            {loading ? '...' : formatMoney(solde?.solde)}
          </div>
          <div className="vh-bal-sub">
            Mis à jour {solde?.derniereMiseAJour ? formatDate(solde.derniereMiseAJour) : 'maintenant'}
          </div>
        </div>


      </div>

      {/* Quick action - Nouveau QR */}
      <Link to="/vendeurs/qr" className="vh-quick">
        <div className="vh-quick-left">
          <div className="vh-quick-icon"><QrCode size={24} color="white" /></div>
          <div>
            <div className="vh-quick-title">Nouveau QR Code</div>
            <div className="vh-quick-sub">Encaisser un paiement maintenant</div>
          </div>
        </div>
        <ArrowRight size={20} color="rgba(255,255,255,0.8)" />
      </Link>

      {/* Grid: Chart + Recent Tx */}
      <div className="vh-grid-2">

        {/* Chart */}
        <div className="vh-card">
          <StatsChart transactions={allTx} retraits={allRetraits} />
          
          <div className="vh-stats-row">
            <div className="vh-stat-chip">
              <div className="vh-stat-chip-val"><span>{loading ? '...' : formatMoney(stats.today)}</span></div>
              <div className="vh-stat-chip-label">Aujourd'hui</div>
            </div>
            <div className="vh-stat-chip">
              <div className="vh-stat-chip-val">{loading ? '...' : stats.count}</div>
              <div className="vh-stat-chip-label">Transactions</div>
            </div>
            <div className="vh-stat-chip">
              <div className="vh-stat-chip-val"><span>{loading ? '...' : formatMoney(stats.total)}</span></div>
              <div className="vh-stat-chip-label">Ce mois</div>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="vh-card">
          <div className="vh-section-title">
            Dernières ventes
            <Receipt size={16} style={{ color: '#2563eb' }} />
          </div>
          {recentTx.length === 0 && !loading ? (
            <div className="vh-empty">Aucune transaction récente</div>
          ) : (
            recentTx.slice(0, 4).map((tx, i) => {
              const s = STATUS_MAP[tx.statut] || STATUS_MAP.PENDING;
              return (
                <div key={tx.id || i} className="vh-tx-item">
                  <div className="vh-tx-left">
                    <div className="vh-tx-icon" style={{ background: s.bg }}>
                      {tx.statut === 'SUCCESS' || tx.statut === 'SUCCESSFUL'
                        ? <CheckCircle2 size={16} color={s.color} />
                        : tx.statut === 'PENDING'
                        ? <Clock size={16} color={s.color} />
                        : <XCircle size={16} color={s.color} />
                      }
                    </div>
                    <div>
                      <div className="vh-tx-desc">{tx.description || 'Paiement QR'}</div>
                      <div className="vh-tx-date">{formatDate(tx.dateCreation)}</div>
                    </div>
                  </div>
                  <div>
                    <div className={`vh-tx-amount${tx.statut === 'SUCCESS' ? ' success' : ''}`}>
                      +{formatMoney(tx.montant)}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 11 }}>
                      <span className="vh-status-dot" style={{ background: s.dot }} />
                      <span style={{ color: s.color }}>{s.label}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <Link to="/vendeurs/transactions" className="vh-see-all">
            Voir tout l'historique <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
