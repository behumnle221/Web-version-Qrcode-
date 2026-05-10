import { useState, useEffect, useCallback, useRef } from 'react';
import { clientService } from '../../api/clientService';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine, CheckCircle2, Clock, XCircle,
  Phone, AlertTriangle, Loader2, RefreshCw, ChevronLeft, ChevronRight,
  Wallet, ExternalLink
} from 'lucide-react';

/* ── CSS ── */
const CSS = `
  .crt-root { animation: crt-in 0.4s ease-out; }
  @keyframes crt-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .crt-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 1024px) { .crt-grid { grid-template-columns: 1.1fr 1.6fr; } }

  /* ── FORM CARD ── */
  .crt-form-card {
    background: #fff; border-radius: 20px;
    border: 1px solid #e2e8f0; padding: 1.75rem;
    height: fit-content;
  }
  .dark .crt-form-card { background: #0f172a; border-color: #1e293b; }

  .crt-section-title {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .crt-section-title { color: #f1f5f9; }

  .crt-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block; }
  .dark .crt-label { color: #9ca3af; }

  .crt-input {
    width: 100%; height: 48px; padding: 0 1rem;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    background: #fff; color: #1e293b; outline: none; transition: all 0.2s;
    margin-bottom: 1rem;
  }
  .dark .crt-input { background: #1e293b; color: #f1f5f9; border-color: #334155; }
  .crt-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  .crt-operators { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
  .crt-op-btn {
    flex: 1; padding: 0.75rem; border-radius: 12px;
    border: 2px solid #e2e8f0; background: #f8fafc;
    cursor: pointer; transition: all 0.2s;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
  }
  .dark .crt-op-btn { background: #1e293b; border-color: #334155; }
  .crt-op-btn.selected { border-color: #2563eb; background: #eff6ff; }
  .dark .crt-op-btn.selected { background: rgba(37,99,235,0.1); }
  .crt-op-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: #fff; }
  .crt-op-name { font-size: 11px; font-weight: 700; color: #334155; }
  .dark .crt-op-name { color: #94a3b8; }
  .crt-op-btn.selected .crt-op-name { color: #2563eb; }

  .crt-amounts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
  .crt-amount-chip {
    padding: 0.55rem; border-radius: 10px; text-align: center;
    font-size: 12px; font-weight: 700; cursor: pointer;
    border: 1.5px solid #e2e8f0; background: #f8fafc; color: #334155;
    transition: all 0.15s;
  }
  .dark .crt-amount-chip { background: #1e293b; border-color: #334155; color: #94a3b8; }
  .crt-amount-chip:hover, .crt-amount-chip.selected { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

  .crt-balance-info {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem; border-radius: 12px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    margin-bottom: 1.25rem; font-size: 13px;
  }
  .crt-balance-key { color: #1d4ed8; font-weight: 600; }
  .crt-balance-val { font-family: 'Sora', sans-serif; font-weight: 800; color: #1d4ed8; font-size: 15px; }

  .crt-submit {
    width: 100%; height: 50px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(37,99,235,.25);
  }
  .crt-submit:hover { transform: translateY(-1px); }
  .crt-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .crt-spin { animation: crt-spin 1s linear infinite; }
  @keyframes crt-spin { to { transform: rotate(360deg); } }

  .crt-info {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 0.75rem 1rem; border-radius: 10px;
    background: #fffbeb; border: 1px solid #fde68a;
    font-size: 12px; color: #92400e; line-height: 1.5; margin-top: 0.75rem;
  }

  /* ── HISTORY CARD ── */
  .crt-hist-card {
    background: #fff; border-radius: 20px;
    border: 1px solid #e2e8f0; overflow: hidden;
  }
  .dark .crt-hist-card { background: #0f172a; border-color: #1e293b; }
  .crt-hist-header {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark .crt-hist-header { border-color: #1e293b; }

  .crt-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    height: 34px; padding: 0 0.875rem;
    background: #f1f5f9; border: none; border-radius: 8px;
    font-size: 12px; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s;
  }
  .crt-refresh-btn:hover { background: #e2e8f0; }
  .crt-refresh-btn.spinning svg { animation: crt-spin 0.7s linear infinite; }

  .crt-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .dark .crt-item { border-color: #1e293b; }
  .crt-item:last-child { border-bottom: none; }
  .crt-item:hover { background: #f8fafc; }
  .dark .crt-item:hover { background: #1e293b; }
  .crt-item-left { display: flex; align-items: center; gap: 12px; }
  .crt-item-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .crt-item-desc { font-size: 13px; font-weight: 600; color: #0f172a; }
  .dark .crt-item-desc { color: #e2e8f0; }
  .crt-item-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .crt-item-amount { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; color: #dc2626; }

  .crt-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
  }
  .crt-badge-success { background: #f0fdf4; color: #16a34a; }
  .crt-badge-pending { background: #fffbeb; color: #d97706; }
  .crt-badge-failed  { background: #fef2f2; color: #dc2626; }

  .crt-empty { text-align: center; padding: 2.5rem; color: #94a3b8; font-size: 14px; }

  .crt-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.875rem 1.25rem; border-top: 1px solid #e2e8f0;
    font-size: 13px; color: #64748b;
  }
  .dark .crt-pagination { border-color: #1e293b; }
  .crt-page-btns { display: flex; gap: 6px; }
  .crt-page-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: #fff;
    cursor: pointer; color: #475569;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .dark .crt-page-btn { background: #1e293b; border-color: #334155; color: #94a3b8; }
  .crt-page-btn:hover:not(:disabled) { background: #f1f5f9; }
  .crt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── TRACKER (SIMILAIRE RECHARGE) ── */
  .crt-tracker {
    border-radius:20px; border:1px solid #e2e8f0; overflow:hidden;
    background: #fff; animation:crt-in .4s ease-out;
  }
  .dark .crt-tracker { background: #0f172a; border-color:#1e293b; }

  .crt-tracker-header {
    padding:1.5rem;
    background:linear-gradient(135deg,#1e3a8a,#2563eb);
    color:#fff;text-align:center;
  }
  .crt-tracker-amount {
    font-family:'Sora',sans-serif;font-size:32px;font-weight:800;margin-bottom:4px;
  }
  .crt-tracker-sub { font-size:13px;opacity:.8; }

  .crt-steps { padding:1.5rem; }
  .crt-step {
    display:flex;align-items:flex-start;gap:14px;padding:.75rem 0;
    border-bottom:1px solid #f1f5f9;position:relative;
  }
  .dark .crt-step { border-color:#1e293b; }
  .crt-step:last-child { border-bottom:none; }

  .crt-step-line {
    position:absolute;left:17px;top:42px;bottom:-12px;
    width:2px;background:#e2e8f0;
  }
  .dark .crt-step-line { background:#1e293b; }
  .crt-step:last-child .crt-step-line { display:none; }

  .crt-step-icon {
    width:36px;height:36px;border-radius:50%;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    border:2px solid #e2e8f0;background:#f8fafc;
    position:relative;z-index:1;transition:all .3s;
  }
  .crt-step-icon.done { background:#f0fdf4;border-color:#86efac; }
  .crt-step-icon.active { background:#eff6ff;border-color:#93c5fd; animation:crt-pulse 1.5s infinite; }
  .crt-step-icon.fail { background:#fef2f2;border-color:#fca5a5; }

  @keyframes crt-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(37,99,235,.3); }
    50% { box-shadow:0 0 0 6px rgba(37,99,235,0); }
  }

  .crt-step-label { font-size:14px;font-weight:600;color:#0f172a;margin-bottom:3px; }
  .dark .crt-step-label { color:#e2e8f0; }
  .crt-step-desc { font-size:12px;color:#94a3b8; }
  .crt-step-time { font-size:11px;color:#2563eb;margin-top:2px; }

  .crt-status-badge {
    display:inline-flex;align-items:center;gap:6px;
    padding:.5rem 1.25rem;border-radius:20px;font-size:13px;font-weight:700;
    margin: 1.5rem 1.5rem 0;
  }
  .crt-status-pending { background:#fffbeb;color:#d97706;border:1px solid #fde68a; }
  .crt-status-success { background:#f0fdf4;color:#16a34a;border:1px solid #86efac; }
  .crt-status-failed  { background:#fef2f2;color:#dc2626;border:1px solid #fca5a5; }

  .crt-poll-info {
    margin:0 1.5rem 1.5rem;padding:.75rem 1rem;border-radius:12px;
    background:#f8fafc;border:1px solid #e2e8f0;
    display:flex;align-items:center;justify-content:space-between;
    font-size:12px;color:#64748b;
  }
  .dark .crt-poll-info { background:#1e293b;border-color:#334155; }
`;

const OPERATORS = [
  { value: 'Orange_Cameroon', label: 'Orange', color: '#FF6600' },
  { value: 'MTN_Cameroon',   label: 'MTN',    color: '#FFCC00' },
];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

const STATUS_MAP = {
  SUCCESS:    { label: 'Réussi',     cls: 'success', Icon: CheckCircle2 },
  SUCCESSFUL: { label: 'Réussi',     cls: 'success', Icon: CheckCircle2 },
  PENDING:    { label: 'En attente', cls: 'pending', Icon: Clock        },
  FAILED:     { label: 'Échoué',     cls: 'failed',  Icon: XCircle      },
};

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Étapes du retrait ── */
const WITHDRAWAL_STEPS = [
  { key: 'init',    label: 'Demande enregistrée',    desc: 'Votre demande de retrait a été reçue' },
  { key: 'op',      label: 'Traitement opérateur',   desc: 'L\'opérateur Mobile Money traite l\'envoi' },
  { key: 'transfer',label: 'Transfert en cours',     desc: 'Fonds en cours d\'envoi vers votre numéro' },
  { key: 'done',    label: 'Fonds reçus',            desc: 'Le retrait est terminé avec succès' },
];

function getWithdrawalStepState(stepKey, status, pollCount) {
  if (status === 'SUCCESS') return 'done';
  if (status === 'FAILED') {
    if (stepKey === 'init') return 'done';
    if (stepKey === 'op') return 'fail';
    return 'idle';
  }
  // PENDING
  if (stepKey === 'init') return 'done';
  if (stepKey === 'op') return pollCount < 6 ? 'active' : 'done';
  if (stepKey === 'transfer') return pollCount >= 6 ? 'active' : 'idle';
  return 'idle';
}

/* ── Composant Tracker Retrait ── */
function WithdrawalTracker({ retrait, onReset }) {
  const [status, setStatus] = useState(retrait.statut || 'PENDING');
  const [pollCount, setPollCount] = useState(0);
  const [lastPoll, setLastPoll] = useState(new Date());
  const [nextIn, setNextIn] = useState(5);
  
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const pollsRef = useRef(0);

  const poll = async () => {
    if (!retrait.referenceId) return;
    try {
      const res = await clientService.getWithdrawalStatus(retrait.referenceId, retrait.operateur);
      const data = res?.data || res;
      console.log('🔄 Statut retrait reçu:', data);
      
      const rawStatus = String(data?.status || '').toUpperCase();
      const isOk = rawStatus === 'SUCCESS' || rawStatus === 'SUCCESSFUL' || rawStatus === 'COMPLETED' || data?.success === true;
      const isErr = rawStatus === 'FAILED' || rawStatus === 'ERROR' || rawStatus === 'REJECTED';
      
      const newStatus = isOk ? 'SUCCESS' : isErr ? 'FAILED' : 'PENDING';
      
      setStatus(newStatus);
      setLastPoll(new Date());
      pollsRef.current += 1;
      setPollCount(pollsRef.current);

      if (newStatus === 'SUCCESS' || newStatus === 'FAILED' || pollsRef.current >= 30) {
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        if (newStatus === 'SUCCESS') {
          toast.success('Retrait confirmé par l\'opérateur !');
          // On peut forcer un petit délai pour que l'utilisateur voie l'étape finale
        }
        if (newStatus === 'FAILED') toast.error('Retrait échoué.');
      }
    } catch (err) {
      console.error('❌ Erreur lors du polling retrait:', err);
    }
    setNextIn(5);
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 5000);
    countdownRef.current = setInterval(() => {
      setNextIn(n => (n > 1 ? n - 1 : 5));
    }, 1000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [retrait.referenceId]);

  const isSuccess = status === 'SUCCESS';
  const isFailed  = status === 'FAILED';
  const isPending = !isSuccess && !isFailed;
  const opLabel = retrait.operateur === 'Orange_Cameroon' ? 'Orange Money' : 'MTN MoMo';

  return (
    <div className="crt-tracker">
      <div className="crt-tracker-header">
        <div className="crt-tracker-amount">{formatMoney(retrait.montant)}</div>
        <div className="crt-tracker-sub">Retrait {opLabel} · {retrait.telephone}</div>
      </div>

      <div className={`crt-status-badge ${isSuccess ? 'crt-status-success' : isFailed ? 'crt-status-failed' : 'crt-status-pending'}`}>
        {isPending && <><Loader2 size={14} className="crt-spin" /> En cours de traitement…</>}
        {isSuccess && <><CheckCircle2 size={14} /> Retrait réussi !</>}
        {isFailed  && <><XCircle size={14} /> Retrait échoué</>}
      </div>

      <div className="crt-steps">
        {WITHDRAWAL_STEPS.map((step, idx) => {
          const state = isSuccess ? 'done'
                      : isFailed && step.key !== 'init' && step.key !== 'op' ? 'idle'
                      : isFailed && step.key === 'op' ? 'fail'
                      : getWithdrawalStepState(step.key, status, pollCount);

          return (
            <div key={step.key} className="crt-step">
              {idx < WITHDRAWAL_STEPS.length - 1 && <div className="crt-step-line" />}
              <div className={`crt-step-icon ${state}`}>
                {state === 'done'   && <CheckCircle2 size={16} color="#16a34a" />}
                {state === 'active' && <Loader2 size={16} color="#2563eb" className="crt-spin" />}
                {state === 'fail'   && <XCircle size={16} color="#dc2626" />}
                {state === 'idle'   && <Clock size={16} color="#cbd5e1" />}
              </div>
              <div>
                <div className="crt-step-label">{step.label}</div>
                <div className="crt-step-desc">
                  {state === 'fail' ? 'Refusé par l\'opérateur' : step.desc}
                </div>
                {state === 'done' && idx === 0 && (
                  <div className="crt-step-time">✓ {formatTime(lastPoll)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isPending && (
        <div className="crt-poll-info">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Suivi temps réel
          </span>
          <span>Actualisation dans {nextIn}s</span>
        </div>
      )}

      <div style={{ padding: '0 1.5rem 1.5rem', display:'flex', gap:'.75rem' }}>
        <button className="crt-refresh-btn" style={{ flex:1, height:44 }} onClick={onReset}>
          Nouveau retrait
        </button>
        {(isSuccess || isFailed) && (
          <button className="crt-submit" style={{ flex:1, height:44, boxShadow:'none' }} onClick={() => window.location.reload()}>
            Terminer
          </button>
        )}
      </div>
    </div>
  );
}

/* ── COMPOSANT PRINCIPAL ── */
export default function ClientRetraits() {
  const [form, setForm] = useState({ montant: '', operateur: 'Orange_Cameroon', telephone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [initiatedRetrait, setInitiatedRetrait] = useState(null);

  const [retraits, setRetraits] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadHistory = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const [balRes, retRes] = await Promise.allSettled([
        clientService.getBalance(),
        clientService.getWithdrawals(p, 8),
      ]);
      if (balRes.status === 'fulfilled') setBalance(balRes.value);
      if (retRes.status === 'fulfilled') {
        setRetraits(retRes.value?.items || []);
        setTotalPages(retRes.value?.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(0); }, [loadHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.montant || !form.telephone) { toast.error('Remplissez tous les champs.'); return; }
    if (Number(form.montant) < 10) { toast.error('Montant minimum : 10 XAF.'); return; }
    if (balance !== null && Number(form.montant) > balance) {
      toast.error('Solde insuffisant.'); return;
    }
    
    setSubmitting(true);
    try {
      const res = await clientService.requestWithdrawal({
        montant: Number(form.montant),
        operateur: form.operateur,
        telephone: form.telephone,
      });
      
      const data = res?.data || res;
      toast.success('Retrait initié !');
      
      // Activer le tracker
      setInitiatedRetrait({
        ...data,
        montant: Number(form.montant),
        operateur: form.operateur,
        telephone: form.telephone
      });
      
      setForm({ montant: '', operateur: 'Orange_Cameroon', telephone: '' });
      loadHistory(0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du retrait.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await clientService.syncWithdrawals();
      toast.success('Synchronisation effectuée.');
      loadHistory(page);
    } catch {
      toast.error('Erreur de synchronisation.');
    } finally {
      setSyncing(false);
    }
  };

  const insufficient = balance !== null && Number(form.montant) > balance;

  return (
    <div className="crt-root">
      <style>{CSS}</style>
      <div className="crt-grid">

        {/* ── Section Gauche : Formulaire ou Tracker ── */}
        <div>
          {initiatedRetrait ? (
            <WithdrawalTracker 
              retrait={initiatedRetrait} 
              onReset={() => { setInitiatedRetrait(null); loadHistory(0); }} 
            />
          ) : (
            <form className="crt-form-card" onSubmit={handleSubmit}>
              <div className="crt-section-title">
                <ArrowDownToLine size={18} color="#2563eb" />
                Demander un retrait
              </div>

              {balance !== null && (
                <div className="crt-balance-info">
                  <span className="crt-balance-key">Solde disponible</span>
                  <span className="crt-balance-val">{formatMoney(balance)}</span>
                </div>
              )}

              <label className="crt-label">Montant (XAF)</label>
              <div className="crt-amounts">
                {QUICK_AMOUNTS.map(v => (
                  <div
                    key={v}
                    className={`crt-amount-chip${form.montant === String(v) ? ' selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, montant: String(v) }))}
                  >
                    {new Intl.NumberFormat('fr-FR').format(v)}
                  </div>
                ))}
              </div>
              <input
                className="crt-input"
                type="number"
                placeholder="Autre montant"
                value={form.montant}
                min="10"
                onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
              />

              <label className="crt-label">Opérateur</label>
              <div className="crt-operators">
                {OPERATORS.map(op => (
                  <button
                    key={op.value}
                    type="button"
                    className={`crt-op-btn${form.operateur === op.value ? ' selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, operateur: op.value }))}
                  >
                    <div className="crt-op-dot" style={{ background: op.color }}>{op.label[0]}</div>
                    <span className="crt-op-name">{op.label}</span>
                  </button>
                ))}
              </div>

              <label className="crt-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Numéro de téléphone</label>
              <input
                className="crt-input"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
              />

              {insufficient && (
                <div className="crt-info" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  Solde insuffisant pour ce montant.
                </div>
              )}

              <button className="crt-submit" type="submit" disabled={submitting || insufficient}>
                {submitting
                  ? <><Loader2 size={18} className="crt-spin" /> Traitement…</>
                  : <><ArrowDownToLine size={18} /> Retirer {form.montant ? formatMoney(Number(form.montant)) : ''}</>
                }
              </button>

              <div className="crt-info">
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Un délai minimum de 5 min est requis entre deux retraits. Les fonds seront envoyés sur votre Mobile Money.</span>
              </div>
            </form>
          )}
        </div>

        {/* ── Section Droite : Historique ── */}
        <div className="crt-hist-card">
          <div className="crt-hist-header">
            <div className="crt-section-title" style={{ margin: 0 }}>
              <Clock size={16} color="#2563eb" />
              Historique des retraits
            </div>
            <button className={`crt-refresh-btn${syncing ? ' spinning' : ''}`} onClick={handleSync} type="button">
              <RefreshCw size={13} /> Sync
            </button>
          </div>

          {loading ? (
            <div className="crt-empty">Chargement…</div>
          ) : retraits.length === 0 ? (
            <div className="crt-empty">Aucun retrait effectué</div>
          ) : (
            retraits.map((r, i) => {
              const s = STATUS_MAP[r.statut] || STATUS_MAP.PENDING;
              return (
                <div key={r.id || i} className="crt-item">
                  <div className="crt-item-left">
                    <div className="crt-item-icon" style={{ background: s.cls === 'success' ? '#f0fdf4' : s.cls === 'pending' ? '#fffbeb' : '#fef2f2' }}>
                      <s.Icon size={18} color={s.cls === 'success' ? '#16a34a' : s.cls === 'pending' ? '#d97706' : '#dc2626'} />
                    </div>
                    <div>
                      <div className="crt-item-desc">
                        {r.operateur === 'Orange_Cameroon' ? 'Orange Money' : 'MTN MoMo'}
                      </div>
                      <div className="crt-item-sub">{formatDate(r.dateCreation)} · {r.telephone}</div>
                      <span className={`crt-badge crt-badge-${s.cls}`} style={{ marginTop: 3 }}>
                        <s.Icon size={10} /> {s.label}
                      </span>
                    </div>
                  </div>
                  <div className="crt-item-amount">-{formatMoney(r.montant)}</div>
                </div>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="crt-pagination">
              <span>Page {page + 1} / {totalPages}</span>
              <div className="crt-page-btns">
                <button className="crt-page-btn" disabled={page === 0} onClick={() => { setPage(p => p - 1); loadHistory(page - 1); }}>
                  <ChevronLeft size={14} />
                </button>
                <button className="crt-page-btn" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); loadHistory(page + 1); }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
