import { useState, useEffect, useRef } from 'react';
import { clientService } from '../../api/clientService';
import { paymentService } from '../../api/paymentService';
import toast from 'react-hot-toast';
import {
  Wallet, CreditCard, Phone, CheckCircle2,
  Loader2, AlertTriangle, XCircle, Clock,
  RefreshCw, ExternalLink
} from 'lucide-react';

/* ── Décodage intelligent des erreurs de recharge ── */
function parseRechargeError(err) {
  console.log('🔍 Tentative de décodage erreur:', err);
  
  // 1. Extraire toutes les sources de message possibles
  const springMsg  = err?.response?.data?.message || '';         // message Spring Boot
  const httpBody   = typeof err?.response?.data === 'string'     // body brut parfois string
    ? err?.response?.data : JSON.stringify(err?.response?.data || {});
  const jsMsg      = err?.message || '';
  const httpStatus = err?.response?.status;

  // 2. Concaténer tout en une seule chaîne pour chercher les mots-clés
  const fullRaw = [springMsg, httpBody, jsMsg].join(' ');
  const msg = fullRaw.toLowerCase();
  
  console.log('🔍 Message brut concaténé:', fullRaw);

  // ── Codes Aangaraa / Orange Money ───────────────────────────────────────
  // Code 60019 = "Le solde du compte du payeur est insuffisant" (Orange)
  if (msg.includes('60019') || msg.includes('insuffisant') || msg.includes('solde du compte')
    || msg.includes('payeur') || msg.includes('insufficient') || msg.includes('not enough')
    || (msg.includes('solde') && msg.includes('insuffi'))) {
    return {
      title: 'Solde Orange Money insuffisant',
      detail: 'Votre compte Orange Money ne dispose pas du montant nécessaire pour effectuer cette recharge.',
      tip: '💡 Rechargez d\'abord votre compte Orange Money (via *150#), puis relancez la recharge PayQr.',
      code: '60019',
      color: '#ea580c', bg: '#fff7ed', border: '#fed7aa',
    };
  }
  // Code MTN équivalent ou "insufficient funds"
  if (msg.includes('insufficient funds') || msg.includes('fonds insuffisants')) {
    return {
      title: 'Solde MTN MoMo insuffisant',
      detail: 'Votre compte MTN Mobile Money ne dispose pas du montant nécessaire pour effectuer cette recharge.',
      tip: '💡 Rechargez d\'abord votre MTN MoMo (via *126#), puis relancez la recharge PayQr.',
      color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    };
  }
  // Numéro invalide / non enregistré OM
  if (msg.includes('subscriber not found') || msg.includes('invalid msisdn')
    || (msg.includes('numéro') && msg.includes('invalide'))
    || msg.includes('not registered') || msg.includes('abonné')) {
    return {
      title: 'Numéro non reconnu',
      detail: 'Le numéro de téléphone saisi n\'est pas enregistré chez cet opérateur ou est incorrect.',
      tip: '💡 Format attendu : +237 6XX XXX XXX. Vérifiez que le numéro correspond bien à l\'opérateur sélectionné.',
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    };
  }
  // Mauvais opérateur
  if (msg.includes('wrong operator') || msg.includes('mauvais opérateur')
    || (msg.includes('operator') && msg.includes('invalid'))) {
    return {
      title: 'Opérateur incorrect',
      detail: 'Le numéro saisi ne correspond pas à l\'opérateur sélectionné.',
      tip: '💡 Orange Money → numéros 069x, 065x | MTN MoMo → numéros 067x, 068x.',
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    };
  }
  // Timeout / connexion
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('connection refused')
    || msg.includes('network') || msg.includes('réseau') || httpStatus === 503 || httpStatus === 504) {
    return {
      title: 'Service temporairement indisponible',
      detail: 'Impossible de contacter le service de paiement. Le réseau ou l\'opérateur est peut-être temporairement indisponible.',
      tip: '💡 Attendez 30 secondes et réessayez. Si le problème persiste, contactez le support PayQr.',
      color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff',
    };
  }
  // Montant hors limites
  if (msg.includes('limit') || msg.includes('maximum') || msg.includes('minimum')
    || msg.includes('plafond') || (msg.includes('amount') && msg.includes('exceed'))) {
    return {
      title: 'Montant hors limites',
      detail: 'Le montant saisi dépasse les limites de transaction autorisées par votre opérateur Mobile Money.',
      tip: '💡 Les plafonds classiques sont : Orange Money max 500 000 XAF/jour, MTN MoMo max 1 000 000 XAF/jour.',
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    };
  }
  // Transaction dupliquée
  if (msg.includes('duplicate') || msg.includes('already') || msg.includes('déjà en cours')) {
    return {
      title: 'Transaction déjà en cours',
      detail: 'Une recharge est déjà en attente pour ce numéro. Attendez sa finalisation avant d\'en lancer une nouvelle.',
      tip: '💡 Vérifiez votre téléphone — une notification de confirmation Mobile Money est peut-être en attente.',
      color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    };
  }
  // Erreur 500 générique du backend
  if (httpStatus === 500 || httpStatus === 400) {
    // Essayer d'extraire le message Aangaraa imbriqué depuis le JSON
    let aangaraaMsg = '';
    try {
      // Le message Spring contient souvent le JSON d'Aangaraa en tant que string
      const match = fullRaw.match(/"inittxnmessage"\s*:\s*"([^"]+)"/);
      if (match) aangaraaMsg = match[1];
    } catch { /* ignore */ }

    return {
      title: 'Recharge refusée',
      detail: aangaraaMsg
        ? `L\'opérateur a refusé la transaction : "${aangaraaMsg}".`
        : 'La recharge a été refusée par l\'opérateur Mobile Money. Vérifiez votre solde et vos informations.',
      tip: '💡 Assurez-vous que votre compte Mobile Money est bien approvisionné et actif.',
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    };
  }
  // Fallback absolu
  return {
    title: 'Recharge échouée',
    detail: 'Une erreur inattendue s\'est produite. Veuillez vérifier vos informations et réessayer.',
    tip: null,
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
  };
}

/* ── CSS ── */
const CSS = `
  .crch-root { animation: crch-in 0.4s ease-out; max-width: 580px; }
  @keyframes crch-in { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
  .crch-spin { animation: crch-sp 1s linear infinite; }
  @keyframes crch-sp { to{transform:rotate(360deg);} }

  /* hero */
  .crch-hero {
    border-radius:20px; padding:1.75rem;
    background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%);
    color:#fff; box-shadow:0 8px 32px rgba(37,99,235,.25);
    margin-bottom:1.5rem; position:relative; overflow:hidden;
  }
  .crch-hero-deco { position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(255,255,255,0.05);border-radius:50%; }
  .crch-hero-label { font-size:12px;opacity:.75;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;display:flex;align-items:center;gap:6px; }
  .crch-hero-title { font-family:'Sora',sans-serif;font-size:15px;font-weight:700; }
  .crch-hero-sub { font-size:12px;opacity:.7;margin-top:4px; }

  /* form card */
  .crch-card { background:#fff;border-radius:20px;border:1px solid #e2e8f0;padding:1.75rem; }
  .dark .crch-card { background:#0f172a;border-color:#1e293b; }
  .crch-title { font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0f172a;margin-bottom:1rem; }
  .dark .crch-title { color:#f1f5f9; }
  .crch-label { font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;display:block; }
  .dark .crch-label { color:#9ca3af; }
  .crch-input {
    width:100%;height:48px;padding:0 1rem;border:1.5px solid #e2e8f0;border-radius:12px;
    font-size:15px;font-weight:600;font-family:'Inter',sans-serif;
    background:#fff;color:#1e293b;outline:none;transition:all .2s;margin-bottom:1rem;
  }
  .dark .crch-input { background:#1e293b;color:#f1f5f9;border-color:#334155; }
  .crch-input:focus { border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1); }
  .crch-amounts { display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin-bottom:1rem; }
  .crch-chip {
    padding:.65rem;border-radius:10px;text-align:center;font-size:13px;font-weight:700;cursor:pointer;
    border:1.5px solid #e2e8f0;background:#f8fafc;color:#334155;transition:all .15s;
  }
  .dark .crch-chip { background:#1e293b;border-color:#334155;color:#94a3b8; }
  .crch-chip:hover,.crch-chip.sel { border-color:#2563eb;color:#2563eb;background:#eff6ff; }
  .crch-ops { display:flex;gap:.75rem;margin-bottom:1.25rem; }
  .crch-op {
    flex:1;padding:.875rem;border-radius:14px;border:2px solid #e2e8f0;background:#f8fafc;
    cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px;
  }
  .dark .crch-op { background:#1e293b;border-color:#334155; }
  .crch-op.sel { border-color:#2563eb;background:#eff6ff; }
  .crch-op-dot { width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff; }
  .crch-op-name { font-size:12px;font-weight:700;color:#334155; }
  .dark .crch-op-name { color:#94a3b8; }
  .crch-op.sel .crch-op-name { color:#2563eb; }
  .crch-submit {
    width:100%;height:52px;background:linear-gradient(135deg,#2563eb,#1d4ed8);
    border:none;border-radius:14px;font-size:16px;font-weight:700;color:#fff;
    cursor:pointer;transition:all .2s;margin-top:.5rem;
    display:flex;align-items:center;justify-content:center;gap:8px;
    box-shadow:0 6px 20px rgba(37,99,235,.3);
  }
  .crch-submit:hover { transform:translateY(-2px);box-shadow:0 10px 28px rgba(37,99,235,.4); }
  .crch-submit:disabled { opacity:.6;cursor:not-allowed;transform:none; }
  .crch-info {
    display:flex;align-items:flex-start;gap:10px;padding:.875rem 1rem;border-radius:12px;
    background:#fffbeb;border:1px solid #fde68a;margin-top:1rem;font-size:13px;color:#92400e;line-height:1.5;
  }

  /* ── TRACKER ── */
  .crch-tracker {
    border-radius:20px;border:1px solid #e2e8f0;overflow:hidden;
    animation:crch-in .4s ease-out;
  }
  .dark .crch-tracker { border-color:#1e293b; }

  .crch-tracker-header {
    padding:1.5rem;
    background:linear-gradient(135deg,#1e3a8a,#2563eb);
    color:#fff;text-align:center;
  }
  .crch-tracker-amount {
    font-family:'Sora',sans-serif;font-size:32px;font-weight:800;margin-bottom:4px;
  }
  .crch-tracker-sub { font-size:13px;opacity:.8; }

  .crch-steps { padding:1.5rem;background:#fff; }
  .dark .crch-steps { background:#0f172a; }

  .crch-step {
    display:flex;align-items:flex-start;gap:14px;padding:.75rem 0;
    border-bottom:1px solid #f1f5f9;position:relative;
  }
  .dark .crch-step { border-color:#1e293b; }
  .crch-step:last-child { border-bottom:none; }

  .crch-step-line {
    position:absolute;left:17px;top:42px;bottom:-12px;
    width:2px;background:#e2e8f0;
  }
  .dark .crch-step-line { background:#1e293b; }
  .crch-step:last-child .crch-step-line { display:none; }

  .crch-step-icon {
    width:36px;height:36px;border-radius:50%;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    border:2px solid #e2e8f0;background:#f8fafc;
    position:relative;z-index:1;transition:all .3s;
  }
  .crch-step-icon.done { background:#f0fdf4;border-color:#86efac; }
  .crch-step-icon.active { background:#eff6ff;border-color:#93c5fd;animation:crch-pulse 1.5s infinite; }
  .crch-step-icon.fail { background:#fef2f2;border-color:#fca5a5; }
  @keyframes crch-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(37,99,235,.3); }
    50% { box-shadow:0 0 0 6px rgba(37,99,235,0); }
  }

  .crch-step-label { font-size:14px;font-weight:600;color:#0f172a;margin-bottom:3px; }
  .dark .crch-step-label { color:#e2e8f0; }
  .crch-step-desc { font-size:12px;color:#94a3b8; }
  .crch-step-time { font-size:11px;color:#2563eb;margin-top:2px; }

  /* timer bar */
  .crch-timer-bar-wrap {
    height:4px;background:#f1f5f9;border-radius:2px;
    margin:0 1.5rem 1rem;overflow:hidden;
  }
  .dark .crch-timer-bar-wrap { background:#1e293b; }
  .crch-timer-bar {
    height:100%;background:linear-gradient(90deg,#2563eb,#60a5fa);
    border-radius:2px;transition:width .5s linear;
  }

  /* status badge */
  .crch-status-badge {
    display:inline-flex;align-items:center;gap:6px;
    padding:.5rem 1.25rem;border-radius:20px;font-size:13px;font-weight:700;
    margin:0 1.5rem 1rem;
  }
  .crch-status-pending { background:#fffbeb;color:#d97706;border:1px solid #fde68a; }
  .crch-status-success { background:#f0fdf4;color:#16a34a;border:1px solid #86efac; }
  .crch-status-failed  { background:#fef2f2;color:#dc2626;border:1px solid #fca5a5; }

  /* poll info */
  .crch-poll-info {
    margin:0 1.5rem 1rem;padding:.75rem 1rem;border-radius:12px;
    background:#f8fafc;border:1px solid #e2e8f0;
    display:flex;align-items:center;justify-content:space-between;
    font-size:12px;color:#64748b;
  }
  .dark .crch-poll-info { background:#1e293b;border-color:#334155; }

  /* final actions */
  .crch-actions { padding:1rem 1.5rem 1.5rem;display:flex;gap:.75rem; }
  .crch-btn-primary {
    flex:1;height:46px;background:linear-gradient(135deg,#2563eb,#1d4ed8);
    border:none;border-radius:12px;font-size:14px;font-weight:700;color:#fff;
    cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
  }
  .crch-btn-primary:hover { transform:translateY(-1px); }
  .crch-btn-ghost {
    flex:1;height:46px;background:none;border:1.5px solid #e2e8f0;border-radius:12px;
    font-size:14px;font-weight:600;color:#64748b;cursor:pointer;transition:all .2s;
  }
  .dark .crch-btn-ghost { border-color:#334155;color:#94a3b8; }
  .crch-btn-ghost:hover { border-color:#94a3b8;color:#334155; }

  /* ── ERREUR CARD ── */
  .crch-err-card {
    border-radius: 20px; padding: 1.75rem;
    animation: crch-in .4s ease-out;
    margin-bottom: 1.5rem;
  }
  .crch-err-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
  .crch-err-icon {
    width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .crch-err-title { font-family:'Sora',sans-serif; font-size:18px; font-weight:800; }
  .crch-err-detail { font-size:14px; line-height:1.65; margin-bottom:1rem; }
  .crch-err-tip {
    font-size:12px; line-height:1.6; padding:.75rem 1rem; border-radius:10px;
    background: rgba(0,0,0,0.05); margin-bottom:1.25rem;
  }
  .crch-err-actions { display:flex; gap:.75rem; flex-wrap:wrap; }
  .crch-err-btn-retry {
    flex:1; min-width:120px; height:44px;
    border:none; border-radius:12px; font-size:14px; font-weight:700;
    cursor:pointer; transition:all .2s;
    display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .crch-err-btn-cancel {
    flex:1; min-width:120px; height:44px;
    background:none; border:1.5px solid #e2e8f0; border-radius:12px;
    font-size:14px; font-weight:600; color:#64748b; cursor:pointer;
  }
  .dark .crch-err-btn-cancel { border-color:#334155; color:#94a3b8; }
`;

const OPERATORS = [
  { value: 'Orange_Cameroon', label: 'Orange', color: '#FF6600' },
  { value: 'MTN_Cameroon',   label: 'MTN',    color: '#FFCC00' },
];
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];
const POLL_INTERVAL  = 3000;  // 3s entre chaque poll
const MAX_POLLS      = 40;    // 2 minutes max

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Étapes du suivi ── */
const STEPS_DEF = [
  { key: 'init',    label: 'Demande envoyée',            desc: 'Votre recharge a été initiée' },
  { key: 'notif',   label: 'Notification Mobile Money',  desc: 'En attente de votre confirmation téléphonique' },
  { key: 'confirm', label: 'Confirmation opérateur',     desc: 'Traitement par l\'opérateur Mobile Money' },
  { key: 'credit',  label: 'Solde crédité',              desc: 'Votre solde PayQr a été mis à jour' },
];

function getStepState(stepKey, txStatus, pollCount) {
  if (txStatus === 'SUCCESS' || txStatus === 'SUCCESSFUL') {
    return 'done'; // tous done
  }
  if (txStatus === 'FAILED') {
    if (stepKey === 'init') return 'done';
    if (stepKey === 'notif') return 'fail';
    return 'idle';
  }
  // PENDING
  if (stepKey === 'init') return 'done';
  if (stepKey === 'notif') return pollCount < 5 ? 'active' : 'done';
  if (stepKey === 'confirm') return pollCount >= 5 ? 'active' : 'idle';
  return 'idle';
}

/* ── Composant Tracker ── */
function RechargeTracker({ transactionId, montant, operator, telephone, onReset }) {
  const [txStatus, setTxStatus] = useState('PENDING');
  const [pollCount, setPollCount] = useState(0);
  const [lastPoll, setLastPoll] = useState(new Date());
  const [nextIn, setNextIn] = useState(3);
  const [payUrl, setPayUrl] = useState(null);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const pollsRef = useRef(0);

  const poll = async () => {
    if (!transactionId) return;
    try {
      let data;
      // Alterner : tous les 3 polls, appeler Aangaraa directement pour forcer la mise à jour
      // Les autres polls lisent la BD locale (plus rapide)
      if (pollsRef.current % 3 === 0) {
        // Appel direct à Aangaraa via /status/{id} — met à jour la BD si SUCCESS
        try {
          const res = await paymentService.getPaymentStatus(transactionId);
          data = res?.data || res;
        } catch {
          // Si Aangaraa échoue, fallback sur la BD locale
          const res = await paymentService.getLocalStatus(transactionId);
          data = res?.data || res;
        }
      } else {
        // Lecture rapide de la BD locale
        const res = await paymentService.getLocalStatus(transactionId);
        data = res?.data || res;
      }

      const status = data?.status || data?.statut || 'PENDING';
      const normalized = (status === 'SUCCESSFUL') ? 'SUCCESS' : status;
      setTxStatus(normalized);
      setLastPoll(new Date());
      pollsRef.current += 1;
      setPollCount(pollsRef.current);

      if (normalized === 'SUCCESS' || normalized === 'FAILED' || pollsRef.current >= MAX_POLLS) {
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        if (normalized === 'SUCCESS') toast.success('Recharge confirmée ! Solde mis à jour.');
        if (normalized === 'FAILED') toast.error('Recharge refusée par l\'opérateur.');
      }
    } catch {
      // silencieux
    }
    setNextIn(POLL_INTERVAL / 1000);
  };


  useEffect(() => {
    poll(); // poll immédiat
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    countdownRef.current = setInterval(() => {
      setNextIn(n => (n > 1 ? n - 1 : POLL_INTERVAL / 1000));
    }, 1000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [transactionId]);

  const isSuccess = txStatus === 'SUCCESS';
  const isFailed  = txStatus === 'FAILED';
  const isPending = !isSuccess && !isFailed;

  // Calcul barre de progression (max 2 min)
  const progress = Math.min((pollCount / MAX_POLLS) * 100, 100);

  const opLabel = operator === 'Orange_Cameroon' ? 'Orange Money' : 'MTN MoMo';

  return (
    <div className="crch-tracker">
      {/* En-tête montant */}
      <div className="crch-tracker-header">
        <div className="crch-tracker-amount">{fmt(montant)}</div>
        <div className="crch-tracker-sub">Recharge {opLabel} · {telephone}</div>
      </div>

      {/* Badge statut */}
      <div style={{ padding: '1rem 1.5rem 0' }}>
        <div className={`crch-status-badge ${isSuccess ? 'crch-status-success' : isFailed ? 'crch-status-failed' : 'crch-status-pending'}`}>
          {isPending && <><Loader2 size={14} className="crch-spin" /> En attente de confirmation…</>}
          {isSuccess && <><CheckCircle2 size={14} /> Recharge réussie !</>}
          {isFailed  && <><XCircle size={14} /> Recharge refusée</>}
        </div>
      </div>

      {/* Barre de temps (seulement si PENDING) */}
      {isPending && (
        <div className="crch-timer-bar-wrap">
          <div className="crch-timer-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Étapes */}
      <div className="crch-steps">
        {STEPS_DEF.map((step, idx) => {
          const state = isSuccess ? 'done'
            : isFailed && step.key !== 'init' && step.key !== 'notif' ? 'idle'
            : isFailed && step.key === 'notif' ? 'fail'
            : getStepState(step.key, txStatus, pollCount);

          return (
            <div key={step.key} className="crch-step">
              {idx < STEPS_DEF.length - 1 && <div className="crch-step-line" />}
              <div className={`crch-step-icon ${state}`}>
                {state === 'done'   && <CheckCircle2 size={16} color="#16a34a" />}
                {state === 'active' && <Loader2 size={16} color="#2563eb" className="crch-spin" />}
                {state === 'fail'   && <XCircle size={16} color="#dc2626" />}
                {state === 'idle'   && <Clock size={16} color="#cbd5e1" />}
              </div>
              <div>
                <div className="crch-step-label">{step.label}</div>
                <div className="crch-step-desc">
                  {state === 'fail' ? 'Refusé ou délai dépassé' : step.desc}
                </div>
                {state === 'done' && idx === 0 && (
                  <div className="crch-step-time">✓ {fmtTime(lastPoll)}</div>
                )}
                {state === 'done' && isSuccess && idx === 3 && (
                  <div className="crch-step-time">✓ Solde mis à jour</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info polling */}
      {isPending && (
        <div className="crch-poll-info">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Vérification automatique
          </span>
          <span>Prochaine dans {nextIn}s · {pollCount} vérifications effectuées</span>
        </div>
      )}

      {/* Actions */}
      <div className="crch-actions">
        {isPending && payUrl && (
          <a
            href={payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="crch-btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={14} /> Ouvrir le lien de paiement
          </a>
        )}
        <button className="crch-btn-ghost" onClick={onReset}>
          {isSuccess || isFailed ? 'Nouvelle recharge' : 'Annuler'}
        </button>
        {(isSuccess || isFailed) && (
          <button className="crch-btn-primary" onClick={() => window.location.href = '/clients'}>
            <CheckCircle2 size={14} /> Retour à l'accueil
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Composant principal ── */
export default function ClientRecharge() {
  const [form, setForm] = useState({ montant: '', operator: 'Orange_Cameroon', telephone: '' });
  const [loading, setLoading] = useState(false);
  const [initiated, setInitiated] = useState(null); // { transactionId, payUrl }
  const [rechargeError, setRechargeError] = useState(null); // erreur personnalisée

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Formulaire soumis:', form);
    
    if (!form.montant || !form.telephone) { 
      toast.error('Remplissez tous les champs.'); 
      return; 
    }
    if (Number(form.montant) < 100) { 
      toast.error('Montant minimum : 100 XAF.'); 
      return; 
    }
    
    setLoading(true);
    setRechargeError(null);
    
    try {
      console.log('📡 Envoi requête recharge...');
      const res = await clientService.recharge({
        montant: Number(form.montant),
        operator: form.operator,
        telephone: form.telephone,
      });
      console.log('✅ Réponse reçue:', res);
      const data = res?.data || res;
      setInitiated({ transactionId: data?.transactionId, payUrl: data?.payUrl });
      toast.success('Recharge initiée ! Suivez l\'évolution en temps réel.');
    } catch (err) {
      console.error('❌ Erreur attrapée dans handleSubmit:', err);
      const parsed = parseRechargeError(err);
      console.log('🎯 Erreur décodée pour affichage:', parsed);
      setRechargeError(parsed);
      
      // Auto-scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Afficher le tracker après initiation
  if (initiated) {
    return (
      <div className="crch-root">
        <style>{CSS}</style>
        <RechargeTracker
          transactionId={initiated.transactionId}
          payUrl={initiated.payUrl}
          montant={Number(form.montant)}
          operator={form.operator}
          telephone={form.telephone}
          onReset={() => {
            setInitiated(null);
            setForm({ montant: '', operator: 'Orange_Cameroon', telephone: '' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="crch-root">
      <style>{CSS}</style>

      {/* ── CARTE ERREUR PERSONNALISÉE ── */}
      {rechargeError && (
        <div
          className="crch-err-card"
          style={{ background: rechargeError.bg, border: `1.5px solid ${rechargeError.border}` }}
        >
          <div className="crch-err-header">
            <div
              className="crch-err-icon"
              style={{ background: rechargeError.color + '20' }}
            >
              <AlertTriangle size={22} color={rechargeError.color} />
            </div>
            <div>
              <div className="crch-err-title" style={{ color: rechargeError.color }}>
                {rechargeError.title}
              </div>
            </div>
          </div>
          <div className="crch-err-detail" style={{ color: rechargeError.color }}>
            {rechargeError.detail}
          </div>
          {rechargeError.tip && (
            <div className="crch-err-tip" style={{ color: rechargeError.color, opacity: 0.85 }}>
              {rechargeError.tip}
            </div>
          )}
          <div className="crch-err-actions">
            <button
              className="crch-err-btn-retry"
              style={{ background: rechargeError.color, color: '#fff' }}
              onClick={() => setRechargeError(null)}
            >
              <RefreshCw size={14} /> Modifier et réessayer
            </button>
            <button
              className="crch-btn-ghost" 
              style={{ flex: 1, minWidth: '120px' }}
              onClick={() => { setRechargeError(null); setForm({ montant: '', operator: 'Orange_Cameroon', telephone: '' }); }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="crch-hero">
        <div className="crch-hero-deco" />
        <div className="crch-hero-label"><Wallet size={12} /> Recharge</div>
        <div className="crch-hero-title">Rechargez votre solde PayQr</div>
        <div className="crch-hero-sub">Via Orange Money ou MTN Mobile Money</div>
      </div>

      <form className="crch-card" onSubmit={handleSubmit}>
        <div className="crch-title">Montant</div>
        <div className="crch-amounts">
          {QUICK_AMOUNTS.map(v => (
            <div
              key={v}
              className={`crch-chip${form.montant === String(v) ? ' sel' : ''}`}
              onClick={() => setForm(f => ({ ...f, montant: String(v) }))}
            >
              {new Intl.NumberFormat('fr-FR').format(v)}
            </div>
          ))}
        </div>
        <input
          className="crch-input"
          type="number" placeholder="Autre montant (XAF)"
          value={form.montant} min="100"
          onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
        />

        <div className="crch-title">Opérateur</div>
        <div className="crch-ops">
          {OPERATORS.map(op => (
            <button key={op.value} type="button"
              className={`crch-op${form.operator === op.value ? ' sel' : ''}`}
              onClick={() => setForm(f => ({ ...f, operator: op.value }))}
            >
              <div className="crch-op-dot" style={{ background: op.color }}>{op.label[0]}</div>
              <span className="crch-op-name">{op.label}</span>
            </button>
          ))}
        </div>

        <label className="crch-label">
          <Phone size={13} style={{ display: 'inline', marginRight: 4 }} />
          Numéro de téléphone
        </label>
        <input
          className="crch-input" type="tel"
          placeholder="+237 6XX XXX XXX"
          value={form.telephone}
          onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
        />

        <div className="crch-info">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Vous recevrez une notification sur votre téléphone.
            Assurez-vous que votre compte {form.operator === 'Orange_Cameroon' ? 'Orange Money' : 'MTN MoMo'} est approvisionné.
          </span>
        </div>

        <button className="crch-submit" type="submit" disabled={loading}>
          {loading
            ? <><Loader2 size={18} className="crch-spin" /> Traitement…</>
            : <><CreditCard size={18} /> Recharger {form.montant ? fmt(Number(form.montant)) : ''}</>
          }
        </button>
      </form>
    </div>
  );
}
