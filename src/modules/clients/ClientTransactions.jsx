import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../../api/clientService';
import toast from 'react-hot-toast';
import {
  CheckCircle2, Clock, XCircle,
  ChevronLeft, ChevronRight, Search, Filter, X
} from 'lucide-react';

const CSS = `
  .ctx-root { animation: ctx-in 0.3s ease-out; }
  @keyframes ctx-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .ctx-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .ctx-search-wrap { position: relative; flex: 1; min-width: 180px; }
  .ctx-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
  .ctx-search {
    width: 100%; height: 42px; padding: 0 1rem 0 38px;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    background: #fff; color: #1e293b; outline: none; transition: all 0.2s;
  }
  .dark .ctx-search { background: #0f172a; color: #fff; border-color: #1e293b; }
  .ctx-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  .ctx-select {
    height: 42px; padding: 0 0.875rem;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
    background: #fff; color: #334155; outline: none; cursor: pointer;
  }
  .dark .ctx-select { background: #0f172a; color: #e2e8f0; border-color: #1e293b; }

  .ctx-clear-btn {
    display: flex; align-items: center; gap: 4px;
    height: 42px; padding: 0 1rem;
    background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px;
    font-size: 13px; font-weight: 600; color: #64748b;
    cursor: pointer; transition: all 0.15s;
  }
  .ctx-clear-btn:hover { background: #e2e8f0; }

  .ctx-chips { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .ctx-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 0.5rem 1rem; border-radius: 10px;
    font-size: 13px; font-weight: 600;
  }
  .ctx-chip-total { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .ctx-chip-ok    { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .ctx-chip-pend  { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .ctx-chip-fail  { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  .ctx-table-wrap {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0; overflow: hidden;
  }
  .dark .ctx-table-wrap { background: #0f172a; border-color: #1e293b; }

  table.ctx-table { width: 100%; border-collapse: collapse; }
  .ctx-table thead { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .dark .ctx-table thead { background: #1e293b; border-color: #334155; }
  .ctx-table th {
    text-align: left; padding: 0.75rem 1.25rem;
    font-size: 11px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .ctx-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .dark .ctx-table td { border-color: #1e293b; }
  .ctx-table tr:last-child td { border-bottom: none; }
  .ctx-table tr:hover td { background: #f8fafc; }
  .dark .ctx-table tr:hover td { background: #1e293b; }

  .ctx-amount-debit  { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; color: #dc2626; }
  .ctx-amount-credit { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; color: #16a34a; }
  .ctx-desc { font-weight: 600; color: #0f172a; }
  .dark .ctx-desc { color: #e2e8f0; }
  .ctx-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }

  .ctx-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
  }
  .ctx-badge-success { background: #f0fdf4; color: #16a34a; }
  .ctx-badge-pending { background: #fffbeb; color: #d97706; }
  .ctx-badge-failed  { background: #fef2f2; color: #dc2626; }

  .ctx-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.875rem 1.25rem; border-top: 1px solid #e2e8f0;
    font-size: 13px; color: #64748b;
  }
  .dark .ctx-pagination { border-color: #1e293b; }
  .ctx-page-btns { display: flex; gap: 6px; }
  .ctx-page-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: #fff;
    cursor: pointer; color: #475569;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .dark .ctx-page-btn { background: #1e293b; border-color: #334155; color: #94a3b8; }
  .ctx-page-btn:hover:not(:disabled) { background: #f1f5f9; }
  .ctx-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .ctx-empty { text-align: center; padding: 3rem; color: #94a3b8; font-size: 14px; }

  .ctx-mobile-list { display: none; }
  @media (max-width: 768px) {
    .ctx-table-wrap { display: none; }
    .ctx-mobile-list { display: block; }
  }
  .ctx-m-item {
    background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
    padding: 1rem; margin-bottom: 0.75rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark .ctx-m-item { background: #0f172a; border-color: #1e293b; }
  .ctx-m-left { display: flex; align-items: center; gap: 10px; }
  .ctx-m-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
`;

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS = {
  SUCCESS:    { label: 'Réussi',     cls: 'success', Icon: CheckCircle2 },
  SUCCESSFUL: { label: 'Réussi',     cls: 'success', Icon: CheckCircle2 },
  PENDING:    { label: 'En attente', cls: 'pending', Icon: Clock        },
  FAILED:     { label: 'Échoué',     cls: 'failed',  Icon: XCircle      },
};

export default function ClientTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [error, setError] = useState(null);

  const load = useCallback(async (p = 0) => {
    setLoading(true); setError(null);
    try {
      const res = await clientService.getTransactions(p, 10);
      setTransactions(res.items || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.items?.length || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement.');
      toast.error('Erreur de chargement', { id: 'ctx-err' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const clearFilters = () => { setStatut(''); setSearch(''); };

  const filtered = transactions.filter(tx => {
    const matchSearch = !search || (tx.description || '').toLowerCase().includes(search.toLowerCase()) || String(tx.montant).includes(search);
    const matchStatut = !statut || tx.statut === statut;
    return matchSearch && matchStatut;
  });

  const successCount = transactions.filter(t => t.statut === 'SUCCESS' || t.statut === 'SUCCESSFUL').length;
  const pendingCount = transactions.filter(t => t.statut === 'PENDING').length;
  const failedCount  = transactions.filter(t => t.statut === 'FAILED').length;

  return (
    <div className="ctx-root">
      <style>{CSS}</style>

      <div className="ctx-toolbar">
        <div className="ctx-search-wrap">
          <Search size={16} className="ctx-search-icon" />
          <input
            className="ctx-search"
            placeholder="Rechercher un paiement…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="ctx-select" value={statut} onChange={e => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="SUCCESS">Réussi</option>
          <option value="PENDING">En attente</option>
          <option value="FAILED">Échoué</option>
        </select>
        {(statut || search) && (
          <button className="ctx-clear-btn" onClick={clearFilters}><X size={14} /> Effacer</button>
        )}
      </div>

      <div className="ctx-chips">
        <div className="ctx-chip ctx-chip-total"><Filter size={12} /> {totalElements} transactions</div>
        <div className="ctx-chip ctx-chip-ok"><CheckCircle2 size={12} /> {successCount} réussies</div>
        <div className="ctx-chip ctx-chip-pend"><Clock size={12} /> {pendingCount} en attente</div>
        <div className="ctx-chip ctx-chip-fail"><XCircle size={12} /> {failedCount} échouées</div>
      </div>

      {error && !loading && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1rem', fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => load(page)} style={{ background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '0.4rem 0.875rem', cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      {/* Table desktop */}
      <div className="ctx-table-wrap">
        {loading ? (
          <div className="ctx-empty">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="ctx-empty">Aucune transaction trouvée</div>
        ) : (
          <table className="ctx-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => {
                const s = STATUS[tx.statut] || STATUS.PENDING;
                const isCredit = tx.type === 'RECHARGE';
                return (
                  <tr key={tx.id || i}>
                    <td>
                      <div className="ctx-desc">{tx.description || 'Paiement QR'}</div>
                      {tx.transactionId && <div className="ctx-sub">#{tx.transactionId}</div>}
                    </td>
                    <td className={isCredit ? 'ctx-amount-credit' : 'ctx-amount-debit'}>
                      {isCredit ? '+' : '-'}{formatMoney(tx.montant)}
                    </td>
                    <td>
                      <span className={`ctx-badge ctx-badge-${s.cls}`}>
                        <s.Icon size={11} /> {s.label}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{formatDate(tx.dateCreation)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="ctx-pagination">
            <span>Page {page + 1} / {totalPages}</span>
            <div className="ctx-page-btns">
              <button className="ctx-page-btn" disabled={page === 0} onClick={() => { setPage(p => p - 1); load(page - 1); }}>
                <ChevronLeft size={14} />
              </button>
              <button className="ctx-page-btn" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); load(page + 1); }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile list */}
      <div className="ctx-mobile-list">
        {filtered.map((tx, i) => {
          const s = STATUS[tx.statut] || STATUS.PENDING;
          const isCredit = tx.type === 'RECHARGE';
          return (
            <div key={tx.id || i} className="ctx-m-item">
              <div className="ctx-m-left">
                <div className="ctx-m-icon" style={{ background: '#eff6ff' }}>
                  <s.Icon size={16} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{tx.description || 'Paiement QR'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{formatDate(tx.dateCreation)}</div>
                  <span className={`ctx-badge ctx-badge-${s.cls}`} style={{ marginTop: 4 }}>{s.label}</span>
                </div>
              </div>
              <div className={isCredit ? 'ctx-amount-credit' : 'ctx-amount-debit'}>
                {isCredit ? '+' : '-'}{formatMoney(tx.montant)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
