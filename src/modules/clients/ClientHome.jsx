import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { clientService } from '../../api/clientService';
import toast from 'react-hot-toast';
import {
  Wallet, ScanLine, RefreshCw, ArrowDownToLine,
  Receipt, CheckCircle2, Clock, XCircle,
  ArrowRight, ChevronRight, TrendingUp, Plus
} from 'lucide-react';

/* ── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .ch-root { animation: ch-fade-in 0.4s ease-out; }
  @keyframes ch-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ch-greeting { margin-bottom: 1.75rem; }
  .ch-greeting-day { font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px; }
  .ch-greeting-name {
    font-family: 'Sora', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #0f172a; letter-spacing: -0.02em;
  }
  .dark .ch-greeting-name { color: #f1f5f9; }

  /* ── SOLDE CARD ── */
  .ch-balance-card {
    border-radius: 20px;
    padding: 1.75rem;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
    color: #fff;
    box-shadow: 0 8px 32px rgba(37,99,235,.25);
    margin-bottom: 1.25rem;
  }
  .ch-balance-deco {
    position: absolute; top: 0; right: 0;
    width: 220px; height: 220px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  .ch-balance-deco2 {
    position: absolute; bottom: -40px; left: 100px;
    width: 150px; height: 150px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
  }
  .ch-bal-label {
    font-size: 12px; font-weight: 600;
    opacity: 0.75; text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 6px;
  }
  .ch-bal-amount {
    font-family: 'Sora', sans-serif;
    font-size: clamp(30px, 5vw, 42px); font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 1.25rem;
  }
  .ch-bal-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .ch-bal-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 0.55rem 1.1rem;
    border-radius: 10px;
    font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    text-decoration: none; border: none;
  }
  .ch-bal-btn-primary {
    background: rgba(255,255,255,0.9);
    color: #1d4ed8;
  }
  .ch-bal-btn-primary:hover { background: #fff; transform: translateY(-1px); }
  .ch-bal-btn-ghost {
    background: rgba(255,255,255,0.12);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .ch-bal-btn-ghost:hover { background: rgba(255,255,255,0.2); }

  .ch-bal-refresh {
    position: absolute; top: 1.25rem; right: 1.25rem;
    width: 32px; height: 32px;
    border-radius: 8px; border: none;
    background: rgba(255,255,255,0.1);
    cursor: pointer; color: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .ch-bal-refresh:hover { background: rgba(255,255,255,0.2); }
  .ch-bal-refresh.spinning { animation: ch-spin 0.7s linear infinite; }
  @keyframes ch-spin { to { transform: rotate(360deg); } }

  /* ── QUICK ACTIONS ── */
  .ch-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  @media (min-width: 640px) {
    .ch-actions-grid { grid-template-columns: repeat(4, 1fr); }
  }
  .ch-action-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.1rem;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    cursor: pointer; text-decoration: none;
    transition: all 0.2s;
  }
  .dark .ch-action-card { background: #0f172a; border-color: #1e293b; }
  .ch-action-card:hover { border-color: #2563eb; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,99,235,.12); }
  .ch-action-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .ch-action-label { font-size: 12px; font-weight: 700; color: #334155; text-align: center; }
  .dark .ch-action-label { color: #94a3b8; }

  /* ── QUICK CTA Scanner ── */
  .ch-scan-cta {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 18px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
    cursor: pointer; text-decoration: none;
    transition: all 0.25s;
    box-shadow: 0 8px 24px rgba(37,99,235,.3);
  }
  .ch-scan-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,99,235,.4); }
  .ch-scan-cta-left { display: flex; align-items: center; gap: 14px; }
  .ch-scan-cta-icon {
    width: 48px; height: 48px;
    background: rgba(255,255,255,0.15);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .ch-scan-cta-title { font-size: 16px; font-weight: 700; color: #fff; }
  .ch-scan-cta-sub { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px; }

  /* ── SECTION ── */
  .ch-section-title {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 700;
    color: #0f172a; margin-bottom: 1rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark .ch-section-title { color: #f1f5f9; }

  .ch-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .dark .ch-card { background: #0f172a; border-color: #1e293b; }

  /* ── RECENT TX ── */
  .ch-tx-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .dark .ch-tx-item { border-color: #1e293b; }
  .ch-tx-item:last-child { border-bottom: none; }
  .ch-tx-left { display: flex; align-items: center; gap: 10px; }
  .ch-tx-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ch-tx-desc { font-size: 13px; font-weight: 600; color: #0f172a; }
  .dark .ch-tx-desc { color: #e2e8f0; }
  .ch-tx-date { font-size: 11px; color: #94a3b8; margin-top: 1px; }
  .ch-tx-amount { font-size: 14px; font-weight: 700; color: #dc2626; }
  .ch-tx-amount.credit { color: #16a34a; }

  .ch-status-dot {
    display: inline-block;
    width: 6px; height: 6px; border-radius: 50%;
    margin-right: 4px;
  }

  .ch-empty {
    text-align: center; padding: 2rem;
    color: #94a3b8; font-size: 14px;
  }

  .ch-see-all {
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
  .ch-see-all:hover { background: #eff6ff; }
  .dark .ch-see-all { background: #1e293b; border-color: #334155; }

  /* ── STATS ROW ── */
  .ch-stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .ch-stat-chip {
    background: #fff; border-radius: 14px;
    padding: 1rem; text-align: center;
    border: 1px solid #e2e8f0;
  }
  .dark .ch-stat-chip { background: #0f172a; border-color: #1e293b; }
  .ch-stat-chip-val {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 800;
    color: #0f172a;
  }
  .dark .ch-stat-chip-val { color: #f1f5f9; }
  .ch-stat-chip-val span { color: #2563eb; }
  .ch-stat-chip-label { font-size: 11px; color: #64748b; margin-top: 3px; }
`;

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

const STATUS_MAP = {
  SUCCESS:    { color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a', label: 'Réussi'     },
  SUCCESSFUL: { color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a', label: 'Réussi'     },
  PENDING:    { color: '#d97706', bg: '#fffbeb', dot: '#d97706', label: 'En attente'  },
  FAILED:     { color: '#dc2626', bg: '#fef2f2', dot: '#dc2626', label: 'Échoué'     },
};

export default function ClientHome() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, count: 0, retraits: 0 });

  const loadAll = useCallback(async () => {
    try {
      const [balRes, txRes] = await Promise.allSettled([
        clientService.getBalance(),
        clientService.getTransactions(0, 5),
      ]);
      if (balRes.status === 'fulfilled') setBalance(balRes.value);
      if (txRes.status === 'fulfilled') {
        const items = txRes.value?.items || [];
        setRecentTx(items);
        const paid = items.filter(t => t.statut === 'SUCCESS' || t.statut === 'SUCCESSFUL');
        setStats({
          total: paid.reduce((s, t) => s + (t.montant || 0), 0),
          count: items.length,
          retraits: items.filter(t => t.type === 'RETRAIT').length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const dayOfWeek = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const nomClient = user?.nom || user?.email || 'Mon Compte';

  return (
    <div className="ch-root">
      <style>{CSS}</style>

      {/* Greeting */}
      <div className="ch-greeting">
        <div className="ch-greeting-day">{dayOfWeek}, bonjour 👋</div>
        <div className="ch-greeting-name">{nomClient}</div>
      </div>

      {/* Balance card */}
      <div className="ch-balance-card">
        <div className="ch-balance-deco" />
        <div className="ch-balance-deco2" />
        <button
          className={`ch-bal-refresh${refreshing ? ' spinning' : ''}`}
          onClick={handleRefresh}
          title="Actualiser"
        >
          <RefreshCw size={14} />
        </button>
        <div className="ch-bal-label"><Wallet size={12} /> Solde Disponible</div>
        <div className="ch-bal-amount">
          {loading ? '...' : formatMoney(balance)}
        </div>
        <div className="ch-bal-actions">
          <Link to="/clients/recharge" className="ch-bal-btn ch-bal-btn-primary">
            <Plus size={14} /> Recharger
          </Link>
          <Link to="/clients/retraits" className="ch-bal-btn ch-bal-btn-ghost">
            <ArrowDownToLine size={14} /> Retirer
          </Link>
        </div>
      </div>

      {/* Stats chips */}
      <div className="ch-stats-row">
        <div className="ch-stat-chip">
          <div className="ch-stat-chip-val"><span>{loading ? '…' : formatMoney(stats.total)}</span></div>
          <div className="ch-stat-chip-label">Dépensé</div>
        </div>
        <div className="ch-stat-chip">
          <div className="ch-stat-chip-val">{loading ? '…' : stats.count}</div>
          <div className="ch-stat-chip-label">Paiements</div>
        </div>
        <div className="ch-stat-chip">
          <div className="ch-stat-chip-val">{loading ? '…' : stats.retraits}</div>
          <div className="ch-stat-chip-label">Retraits</div>
        </div>
      </div>

      {/* Quick CTA - Scanner QR */}
      <Link to="/clients/scanner" className="ch-scan-cta">
        <div className="ch-scan-cta-left">
          <div className="ch-scan-cta-icon">
            <ScanLine size={24} color="white" />
          </div>
          <div>
            <div className="ch-scan-cta-title">Scanner un QR Code</div>
            <div className="ch-scan-cta-sub">Payer un commerçant instantanément</div>
          </div>
        </div>
        <ArrowRight size={20} color="rgba(255,255,255,0.8)" />
      </Link>

      {/* Quick actions */}
      <div className="ch-actions-grid">
        <Link to="/clients/scanner" className="ch-action-card">
          <div className="ch-action-icon" style={{ background: '#eff6ff' }}>
            <ScanLine size={20} color="#2563eb" />
          </div>
          <span className="ch-action-label">Scanner QR</span>
        </Link>
        <Link to="/clients/recharge" className="ch-action-card">
          <div className="ch-action-icon" style={{ background: '#f0fdf4' }}>
            <Plus size={20} color="#16a34a" />
          </div>
          <span className="ch-action-label">Recharger</span>
        </Link>
        <Link to="/clients/retraits" className="ch-action-card">
          <div className="ch-action-icon" style={{ background: '#fff7ed' }}>
            <ArrowDownToLine size={20} color="#ea580c" />
          </div>
          <span className="ch-action-label">Retirer</span>
        </Link>
        <Link to="/clients/transactions" className="ch-action-card">
          <div className="ch-action-icon" style={{ background: '#fdf4ff' }}>
            <Receipt size={20} color="#9333ea" />
          </div>
          <span className="ch-action-label">Historique</span>
        </Link>
      </div>

      {/* Recent transactions */}
      <div className="ch-card">
        <div className="ch-section-title">
          Transactions récentes
          <Receipt size={16} style={{ color: '#2563eb' }} />
        </div>

        {loading ? (
          <div className="ch-empty">Chargement…</div>
        ) : recentTx.length === 0 ? (
          <div className="ch-empty">Aucune transaction pour l'instant</div>
        ) : (
          recentTx.slice(0, 5).map((tx, i) => {
            const s = STATUS_MAP[tx.statut] || STATUS_MAP.PENDING;
            const isCredit = tx.type === 'RECHARGE';
            return (
              <div key={tx.id || i} className="ch-tx-item">
                <div className="ch-tx-left">
                  <div className="ch-tx-icon" style={{ background: s.bg }}>
                    {tx.statut === 'SUCCESS' || tx.statut === 'SUCCESSFUL'
                      ? <CheckCircle2 size={16} color={s.color} />
                      : tx.statut === 'PENDING'
                      ? <Clock size={16} color={s.color} />
                      : <XCircle size={16} color={s.color} />
                    }
                  </div>
                  <div>
                    <div className="ch-tx-desc">{tx.description || 'Paiement QR'}</div>
                    <div className="ch-tx-date">{formatDate(tx.dateCreation)}</div>
                  </div>
                </div>
                <div>
                  <div className={`ch-tx-amount${isCredit ? ' credit' : ''}`}>
                    {isCredit ? '+' : '-'}{formatMoney(tx.montant)}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11 }}>
                    <span className="ch-status-dot" style={{ background: s.dot }} />
                    <span style={{ color: s.color }}>{s.label}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <Link to="/clients/transactions" className="ch-see-all">
          Voir tout l'historique <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
