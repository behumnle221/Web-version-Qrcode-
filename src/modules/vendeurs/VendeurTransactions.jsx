import { useState, useEffect, useCallback } from 'react';
import { vendeurService } from '../../api/vendeurService';
import toast from 'react-hot-toast';
import {
  Download, Filter, X, CheckCircle2, Clock,
  XCircle, ChevronLeft, ChevronRight, Search
} from 'lucide-react';

/* ── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .vtx-root { animation: vtx-in 0.3s ease-out; }
  @keyframes vtx-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .vtx-toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .vtx-search-wrap {
    position: relative; flex: 1; min-width: 180px;
  }
  .vtx-search-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%); color: #94a3b8; pointer-events: none;
  }
  .vtx-search {
    width: 100%; height: 42px; padding: 0 1rem 0 38px;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    background: #fff; color: #1e293b; outline: none; transition: all 0.2s;
  }
  .dark .vtx-search { background: #0f172a; color: #fff; border-color: #1e293b; }
  .vtx-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  .vtx-select {
    height: 42px; padding: 0 0.875rem;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
    background: #fff; color: #334155; outline: none; cursor: pointer;
    transition: all 0.2s;
  }
  .dark .vtx-select { background: #0f172a; color: #e2e8f0; border-color: #1e293b; }
  .vtx-select:focus { border-color: #2563eb; }

  .vtx-date { height: 42px; padding: 0 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-family: 'Inter', sans-serif; background: #fff; color: #334155; outline: none; cursor: pointer; }
  .dark .vtx-date { background: #0f172a; color: #e2e8f0; border-color: #1e293b; }

  .vtx-export-btn {
    display: flex; align-items: center; gap: 6px;
    height: 42px; padding: 0 1.25rem;
    background: #0f172a; border: none; border-radius: 12px;
    font-size: 13px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .vtx-export-btn:hover { background: #1e293b; }
  .vtx-export-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .vtx-clear-btn {
    display: flex; align-items: center; gap: 4px;
    height: 42px; padding: 0 1rem;
    background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px;
    font-size: 13px; font-weight: 600; color: #64748b;
    cursor: pointer; transition: all 0.15s;
  }
  .vtx-clear-btn:hover { background: #e2e8f0; }

  /* ── SUMMARY CHIPS ── */
  .vtx-chips { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .vtx-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 0.5rem 1rem; border-radius: 10px;
    font-size: 13px; font-weight: 600;
  }
  .vtx-chip-total  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .vtx-chip-ok     { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .vtx-chip-pend   { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .vtx-chip-fail   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  /* ── TABLE ── */
  .vtx-table-wrap {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0; overflow: hidden;
  }
  .dark .vtx-table-wrap { background: #0f172a; border-color: #1e293b; }

  table.vtx-table { width: 100%; border-collapse: collapse; }
  .vtx-table thead { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .dark .vtx-table thead { background: #1e293b; border-color: #334155; }
  .vtx-table th {
    text-align: left; padding: 0.75rem 1.25rem;
    font-size: 11px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .vtx-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .dark .vtx-table td { border-color: #1e293b; }
  .vtx-table tr:last-child td { border-bottom: none; }
  .vtx-table tr:hover td { background: #f8fafc; }
  .dark .vtx-table tr:hover td { background: #1e293b; }

  .vtx-amount { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; color: #16a34a; }
  .vtx-desc { font-weight: 600; color: #0f172a; }
  .dark .vtx-desc { color: #e2e8f0; }
  .vtx-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }

  .vtx-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
  }
  .vtx-badge-success { background: #f0fdf4; color: #16a34a; }
  .vtx-badge-pending { background: #fffbeb; color: #d97706; }
  .vtx-badge-failed  { background: #fef2f2; color: #dc2626; }

  .vtx-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.875rem 1.25rem; border-top: 1px solid #e2e8f0;
    font-size: 13px; color: #64748b;
  }
  .dark .vtx-pagination { border-color: #1e293b; }
  .vtx-page-btns { display: flex; gap: 6px; }
  .vtx-page-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: #fff;
    cursor: pointer; color: #475569;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; font-size: 13px; font-weight: 600;
  }
  .dark .vtx-page-btn { background: #1e293b; border-color: #334155; color: #94a3b8; }
  .vtx-page-btn:hover:not(:disabled) { background: #f1f5f9; }
  .vtx-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .vtx-empty {
    text-align: center; padding: 3rem; color: #94a3b8; font-size: 14px;
  }

  .vtx-mobile-list { display: none; }
  @media (max-width: 768px) {
    .vtx-table-wrap { display: none; }
    .vtx-mobile-list { display: block; }
  }

  .vtx-m-item {
    background: #fff; border-radius: 14px; border: 1px solid #e2e8f0;
    padding: 1rem; margin-bottom: 0.75rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark .vtx-m-item { background: #0f172a; border-color: #1e293b; }
  .vtx-m-left { display: flex; align-items: center; gap: 10px; }
  .vtx-m-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
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

export default function VendeurTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const [txError, setTxError] = useState(null);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setTxError(null);
    try {
      const res = await vendeurService.getTransactions({
        page: p, size: 10,
        statut: statut || null,
        dateDebut: dateDebut ? `${dateDebut}T00:00:00` : null,
        dateFin:   dateFin   ? `${dateFin}T23:59:59`   : null,
      });
      setTransactions(res.items || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erreur inconnue';
      console.error('[Transactions] Erreur:', status, msg, err);

      if (status === 401) {
        // Le interceptor axios gère la redirection
        setTxError('Session expirée. Redirection...');
      } else if (status === 403) {
        setTxError('Accès refusé (403). Vérifiez vos permissions.');
      } else if (status === 500) {
        setTxError(`Erreur serveur (500): ${msg}`);
        toast.error('Erreur serveur lors du chargement', { id: 'tx-load-error' });
      } else if (!status) {
        setTxError('Erreur réseau. Vérifiez votre connexion et que le backend est actif.');
        toast.error('Backend inaccessible', { id: 'tx-load-error' });
      } else {
        setTxError(`Erreur ${status}: ${msg}`);
        toast.error(`Erreur ${status}`, { id: 'tx-load-error' });
      }
    } finally {
      setLoading(false);
    }
  }, [statut, dateDebut, dateFin]);

  useEffect(() => { load(0); setPage(0); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await vendeurService.exportCsv();
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a'); a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé !');
    } catch { toast.error('Erreur lors de l\'export'); }
    finally { setExporting(false); }
  };

  const clearFilters = () => { setStatut(''); setDateDebut(''); setDateFin(''); setSearch(''); };

  const filtered = search
    ? transactions.filter(tx =>
        (tx.description || '').toLowerCase().includes(search.toLowerCase()) ||
        String(tx.montant).includes(search)
      )
    : transactions;

  const successCount = transactions.filter(t => t.statut === 'SUCCESS' || t.statut === 'SUCCESSFUL').length;
  const pendingCount = transactions.filter(t => t.statut === 'PENDING').length;
  const failedCount = transactions.filter(t => t.statut === 'FAILED').length;

  return (
    <div className="vtx-root">
      <style>{CSS}</style>

      {/* Toolbar */}
      <div className="vtx-toolbar">
        <div className="vtx-search-wrap">
          <Search size={16} className="vtx-search-icon" />
          <input
            className="vtx-search"
            placeholder="Rechercher une transaction…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="vtx-select" value={statut} onChange={e => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="SUCCESS">Réussi</option>
          <option value="PENDING">En attente</option>
          <option value="FAILED">Échoué</option>
        </select>
        <input className="vtx-date" type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} title="Date de début" />
        <input className="vtx-date" type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} title="Date de fin" />
        {(statut || dateDebut || dateFin || search) && (
          <button className="vtx-clear-btn" onClick={clearFilters}><X size={14} /> Effacer</button>
        )}
        <button className="vtx-export-btn" onClick={handleExport} disabled={exporting}>
          <Download size={14} /> {exporting ? 'Export…' : 'CSV'}
        </button>
      </div>

      {/* Summary chips */}
      <div className="vtx-chips">
        <div className="vtx-chip vtx-chip-total"><Filter size={12} /> {totalElements} transactions</div>
        <div className="vtx-chip vtx-chip-ok"><CheckCircle2 size={12} /> {successCount} réussies</div>
        <div className="vtx-chip vtx-chip-pend"><Clock size={12} /> {pendingCount} en attente</div>
        <div className="vtx-chip vtx-chip-fail"><XCircle size={12} /> {failedCount} échouées</div>
      </div>

      {/* Error state */}
      {txError && !loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '1rem 1.25rem', marginBottom: '1rem',
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14,
          fontSize: 13, color: '#991b1b'
        }}>
          <span style={{ flex: 1 }}>⚠️ {txError}</span>
          <button
            onClick={() => load(page)}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: 8,
              background: '#dc2626', border: 'none',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Table (desktop) */}
      <div className="vtx-table-wrap">
        {loading ? (
          <div className="vtx-empty">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="vtx-empty">Aucune transaction trouvée</div>
        ) : (
          <table className="vtx-table">
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
                return (
                  <tr key={tx.id || i}>
                    <td>
                      <div className="vtx-desc">{tx.description || 'Paiement QR'}</div>
                      {tx.transactionId && <div className="vtx-sub">#{tx.transactionId}</div>}
                    </td>
                    <td className="vtx-amount">+{formatMoney(tx.montant)}</td>
                    <td>
                      <span className={`vtx-badge vtx-badge-${s.cls}`}>
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
          <div className="vtx-pagination">
            <span>{page * 10 + 1}–{Math.min((page + 1) * 10, totalElements)} sur {totalElements}</span>
            <div className="vtx-page-btns">
              <button className="vtx-page-btn" disabled={page === 0} onClick={() => { setPage(p => p - 1); load(page - 1); }}>
                <ChevronLeft size={14} />
              </button>
              <button className="vtx-page-btn" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); load(page + 1); }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile list */}
      <div className="vtx-mobile-list">
        {filtered.map((tx, i) => {
          const s = STATUS[tx.statut] || STATUS.PENDING;
          return (
            <div key={tx.id || i} className="vtx-m-item">
              <div className="vtx-m-left">
                <div className="vtx-m-icon" style={{ background: '#eff6ff' }}>
                  <s.Icon size={16} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{tx.description || 'Paiement QR'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{formatDate(tx.dateCreation)}</div>
                  <span className={`vtx-badge vtx-badge-${s.cls}`} style={{ marginTop: 4 }}>{s.label}</span>
                </div>
              </div>
              <div className="vtx-amount">+{formatMoney(tx.montant)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
