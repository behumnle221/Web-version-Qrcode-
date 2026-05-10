import { useState, useEffect, useCallback } from 'react';
import { vendeurService } from '../../api/vendeurService';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine, CheckCircle2, Clock, XCircle,
  RefreshCw, UserCheck, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

/* ── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .vr-root { animation: vr-in 0.3s ease-out; }
  @keyframes vr-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .vr-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 1024px) { .vr-grid { grid-template-columns: 1fr 1.3fr; } }

  /* ── FORM CARD ── */
  .vr-card {
    background: #fff; border-radius: 20px;
    border: 1px solid #e2e8f0; padding: 1.75rem;
  }
  .dark .vr-card { background: #0f172a; border-color: #1e293b; }

  .vr-card-title {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 800; color: #0f172a;
    margin-bottom: 1.25rem;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .vr-card-title { color: #f1f5f9; }

  /* ── OPERATOR SELECTOR ── */
  .vr-ops { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }

  .vr-op-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 0.9rem 1rem; border-radius: 14px;
    border: 2px solid #e2e8f0;
    background: #f8fafc; cursor: pointer;
    transition: all 0.2s; font-weight: 600;
    font-size: 13px; color: #334155;
  }
  .vr-op-btn:hover { border-color: #94a3b8; }
  .vr-op-btn.active-orange { border-color: #ea580c; background: #fff7ed; color: #ea580c; }
  .vr-op-btn.active-mtn { border-color: #ca8a04; background: #fefce8; color: #854d0e; }
  .vr-op-logo {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px; color: #fff; flex-shrink: 0;
  }

  /* ── FIELD ── */
  .vr-field { margin-bottom: 1rem; }
  .vr-label { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px; display: block; }
  .dark .vr-label { color: #94a3b8; }

  .vr-input {
    width: 100%; height: 48px; padding: 0 1rem;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 15px; font-family: 'Inter', sans-serif;
    color: #1e293b; background: #f8fafc;
    outline: none; transition: all 0.2s;
  }
  .dark .vr-input { background: #1e293b; color: #fff; border-color: #334155; }
  .vr-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  /* ── PHONE VERIFY ── */
  .vr-verify-row { display: flex; gap: 8px; }
  .vr-verify-btn {
    height: 48px; padding: 0 1rem;
    background: #f1f5f9; border: 1.5px solid #e2e8f0;
    border-radius: 12px; font-size: 13px; font-weight: 700;
    color: #475569; cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .vr-verify-btn:hover { background: #e2e8f0; }
  .vr-verify-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .vr-verify-result {
    display: flex; align-items: center; gap: 8px;
    padding: 0.65rem 1rem; border-radius: 10px;
    margin-top: 0.5rem; font-size: 13px; font-weight: 600;
  }
  .vr-verify-ok { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .vr-verify-err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  /* ── SOLDE CHIP ── */
  .vr-solde-chip {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.25rem; background: #eff6ff;
    border: 1px solid #bfdbfe; border-radius: 12px; margin-bottom: 1.25rem;
  }
  .vr-solde-label { font-size: 13px; color: #1e40af; font-weight: 600; }
  .vr-solde-val {
    font-family: 'Sora', sans-serif;
    font-size: 18px; font-weight: 800; color: #1d4ed8;
  }

  /* ── SUBMIT ── */
  .vr-submit {
    width: 100%; height: 52px;
    border: none; border-radius: 14px;
    font-size: 15px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,.15);
  }
  .vr-submit.orange { background: linear-gradient(135deg, #ea580c, #c2410c); box-shadow: 0 6px 20px rgba(234,88,12,.3); }
  .vr-submit.mtn { background: linear-gradient(135deg, #ca8a04, #a16207); box-shadow: 0 6px 20px rgba(202,138,4,.3); }
  .vr-submit.default { background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 6px 20px rgba(37,99,235,.3); }
  .vr-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
  .vr-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .vr-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── HISTORY ── */
  .vr-history-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;
  }

  .vr-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.9rem 0; border-bottom: 1px solid #f1f5f9;
  }
  .dark .vr-item { border-color: #1e293b; }
  .vr-item:last-child { border-bottom: none; }

  .vr-item-left { display: flex; align-items: center; gap: 10px; }
  .vr-item-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .vr-item-label { font-size: 13px; font-weight: 600; color: #0f172a; }
  .dark .vr-item-label { color: #e2e8f0; }
  .vr-item-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .vr-item-amount { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 800; color: #0f172a; }
  .dark .vr-item-amount { color: #f1f5f9; }

  .vr-badge {
    font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
  }
  .vr-badge-success { background: #f0fdf4; color: #16a34a; }
  .vr-badge-pending { background: #fffbeb; color: #d97706; }
  .vr-badge-failed  { background: #fef2f2; color: #dc2626; }

  .vr-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 1rem; }
  .vr-page-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
    background: #fff; cursor: pointer; color: #475569;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; font-size: 13px; font-weight: 600;
  }
  .vr-page-btn:hover:not(:disabled) { background: #f1f5f9; }
  .vr-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .vr-page-info { font-size: 13px; color: #64748b; }

  .vr-sync-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 0.5rem 0.875rem; border-radius: 10px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    font-size: 12px; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s;
  }
  .vr-sync-btn:hover { background: #e2e8f0; }

  .vr-empty { text-align: center; padding: 2rem; color: #94a3b8; font-size: 14px; }
`;

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS = {
  SUCCESS:    { label: 'Réussi',     cls: 'success', Icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
  SUCCESSFUL: { label: 'Réussi',     cls: 'success', Icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
  PENDING:    { label: 'En attente', cls: 'pending', Icon: Clock,        color: '#d97706', bg: '#fffbeb' },
  FAILED:     { label: 'Échoué',     cls: 'failed',  Icon: XCircle,      color: '#dc2626', bg: '#fef2f2' },
};

export default function VendeurRetraits() {
  const [operateur, setOperateur] = useState('Orange_Cameroon');
  const [montant, setMontant] = useState('');
  const [telephone, setTelephone] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [solde, setSolde] = useState(null);

  const [retraits, setRetraits] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadSolde = useCallback(async () => {
    try {
      const s = await vendeurService.getSolde();
      setSolde(s.solde ?? 0);
    } catch {}
  }, []);

  const loadRetraits = useCallback(async (p = 0) => {
    setLoadingList(true);
    try {
      const res = await vendeurService.getRetraits({ page: p, size: 8 });
      setRetraits(res.items || []);
      setTotalPages(res.totalPages || 0);
    } catch { toast.error('Erreur chargement retraits'); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { loadSolde(); loadRetraits(0); }, [loadSolde, loadRetraits]);

  const handleVerify = async () => {
    if (!telephone) return toast.error('Saisissez un numéro');
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await vendeurService.verifyPhone({ telephone, operateur });
      setVerifyResult({ ok: true, name: res?.name || res?.nom || 'Compte vérifié' });
    } catch {
      setVerifyResult({ ok: false, msg: 'Numéro introuvable ou invalide' });
    } finally { setVerifying(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!montant || parseFloat(montant) <= 0) return toast.error('Montant invalide');
    if (!telephone) return toast.error('Numéro requis');
    if (parseFloat(montant) < 10) return toast.error('Montant minimum : 10 XAF');
    if (solde !== null && parseFloat(montant) > solde) return toast.error('Solde insuffisant');

    setSubmitting(true);
    try {
      await vendeurService.demanderRetrait({
        montant: parseFloat(montant),
        operateur,
        telephone,
      });
      toast.success('Retrait demandé avec succès !');
      setMontant('');
      setTelephone('');
      setVerifyResult(null);
      loadSolde();
      loadRetraits(0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du retrait');
    } finally { setSubmitting(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await vendeurService.syncRetraits();
      toast.success(`Sync terminé : ${res?.updated ?? 0} mis à jour`);
      loadRetraits(page);
    } catch { toast.error('Erreur de synchronisation'); }
    finally { setSyncing(false); }
  };

  const btnClass = operateur === 'Orange_Cameroon' ? 'orange' : 'mtn';

  return (
    <div className="vr-root">
      <style>{CSS}</style>

      <div className="vr-grid">
        {/* ── FORM ── */}
        <div>
          <div className="vr-card">
            <div className="vr-card-title">
              <ArrowDownToLine size={18} color="#2563eb" /> Demander un retrait
            </div>

            {/* Solde disponible */}
            {solde !== null && (
              <div className="vr-solde-chip">
                <span className="vr-solde-label">Solde disponible</span>
                <span className="vr-solde-val">{formatMoney(solde)}</span>
              </div>
            )}

            {/* Operator selector */}
            <div className="vr-ops">
              <button
                type="button"
                className={`vr-op-btn${operateur === 'Orange_Cameroon' ? ' active-orange' : ''}`}
                onClick={() => { setOperateur('Orange_Cameroon'); setVerifyResult(null); }}
              >
                <div className="vr-op-logo" style={{ background: '#FF6600' }}>O</div>
                Orange Money
              </button>
              <button
                type="button"
                className={`vr-op-btn${operateur === 'MTN_Cameroon' ? ' active-mtn' : ''}`}
                onClick={() => { setOperateur('MTN_Cameroon'); setVerifyResult(null); }}
              >
                <div className="vr-op-logo" style={{ background: '#FFCC00', color: '#000' }}>M</div>
                MTN MoMo
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Phone */}
              <div className="vr-field">
                <label className="vr-label">Numéro de téléphone bénéficiaire</label>
                <div className="vr-verify-row">
                  <input
                    className="vr-input"
                    placeholder="657515280"
                    value={telephone}
                    onChange={e => { setTelephone(e.target.value); setVerifyResult(null); }}
                  />
                  <button
                    type="button"
                    className="vr-verify-btn"
                    onClick={handleVerify}
                    disabled={verifying || !telephone}
                  >
                    {verifying ? '…' : 'Vérifier'}
                  </button>
                </div>
                {verifyResult && (
                  <div className={`vr-verify-result ${verifyResult.ok ? 'vr-verify-ok' : 'vr-verify-err'}`}>
                    {verifyResult.ok
                      ? <><UserCheck size={14} /> Compte de : <strong>{verifyResult.name}</strong></>
                      : <><AlertCircle size={14} /> {verifyResult.msg}</>
                    }
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="vr-field">
                <label className="vr-label">Montant à retirer (XAF)</label>
                <input
                  className="vr-input"
                  type="number" min="10" placeholder="5000"
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`vr-submit ${btnClass}`}
                disabled={submitting}
              >
                {submitting
                  ? <><div className="vr-spinner" /> Traitement…</>
                  : <><ArrowDownToLine size={16} /> Retirer {montant ? formatMoney(parseFloat(montant)) : ''}</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* ── HISTORY ── */}
        <div className="vr-card">
          <div className="vr-history-header">
            <div className="vr-card-title" style={{ margin: 0 }}>
              Historique des retraits
            </div>
            <button className="vr-sync-btn" onClick={handleSync} disabled={syncing}>
              <RefreshCw size={12} className={syncing ? 'spinning' : ''} /> Sync
            </button>
          </div>

          {loadingList ? (
            <div className="vr-empty">Chargement…</div>
          ) : retraits.length === 0 ? (
            <div className="vr-empty">Aucun retrait effectué</div>
          ) : (
            retraits.map((r, i) => {
              const s = STATUS[r.statut] || STATUS.PENDING;
              const isOrange = r.operateur === 'Orange_Cameroon';
              return (
                <div key={r.id || i} className="vr-item">
                  <div className="vr-item-left">
                    <div className="vr-item-icon" style={{ background: isOrange ? '#fff7ed' : '#fefce8' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: isOrange ? '#FF6600' : '#FFCC00',
                        color: isOrange ? '#fff' : '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 11
                      }}>
                        {isOrange ? 'O' : 'M'}
                      </div>
                    </div>
                    <div>
                      <div className="vr-item-label">{isOrange ? 'Orange Money' : 'MTN MoMo'}</div>
                      <div className="vr-item-sub">{formatDate(r.dateCreation)}</div>
                      <span className={`vr-badge vr-badge-${s.cls}`}>{s.label}</span>
                    </div>
                  </div>
                  <div className="vr-item-amount">{formatMoney(r.montant)}</div>
                </div>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="vr-pagination">
              <button className="vr-page-btn" disabled={page === 0} onClick={() => { setPage(p => p - 1); loadRetraits(page - 1); }}>
                <ChevronLeft size={14} />
              </button>
              <span className="vr-page-info">{page + 1} / {totalPages}</span>
              <button className="vr-page-btn" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); loadRetraits(page + 1); }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
