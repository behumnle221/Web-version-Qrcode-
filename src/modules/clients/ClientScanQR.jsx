import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../api/clientService';
import { qrCodeService } from '../../api/qrCodeService';
import { paymentService } from '../../api/paymentService';
import toast from 'react-hot-toast';
import {
  Upload, ScanLine, CheckCircle2, XCircle,
  AlertTriangle, ArrowRight, X, Loader2,
  Store, Tag, Calendar, Hash
} from 'lucide-react';

/* ── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .csq-root { animation: csq-in 0.4s ease-out; }
  @keyframes csq-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  /* ── UPLOAD ZONE ── */
  .csq-upload-zone {
    border: 2.5px dashed #cbd5e1;
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    background: #f8fafc;
    position: relative;
    margin-bottom: 1.5rem;
  }
  .dark .csq-upload-zone { background: #0f172a; border-color: #334155; }
  .csq-upload-zone:hover, .csq-upload-zone.drag-over {
    border-color: #2563eb;
    background: #eff6ff;
    transform: scale(1.01);
  }
  .dark .csq-upload-zone:hover { background: rgba(37,99,235,0.08); }
  .csq-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }

  .csq-upload-icon {
    width: 72px; height: 72px;
    border-radius: 20px;
    background: #eff6ff;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    transition: all 0.25s;
  }
  .csq-upload-zone:hover .csq-upload-icon { background: #2563eb; }
  .csq-upload-zone:hover .csq-upload-icon svg { color: #fff; }

  .csq-upload-title { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 0.4rem; }
  .dark .csq-upload-title { color: #f1f5f9; }
  .csq-upload-sub { font-size: 13px; color: #64748b; }
  .csq-upload-formats { font-size: 12px; color: #94a3b8; margin-top: 0.5rem; }

  /* ── DIVIDER ── */
  .csq-divider {
    display: flex; align-items: center; gap: 1rem;
    margin: 1.25rem 0; color: #94a3b8; font-size: 13px;
  }
  .csq-divider::before, .csq-divider::after {
    content: ''; flex: 1; height: 1px; background: #e2e8f0;
  }
  .dark .csq-divider::before, .dark .csq-divider::after { background: #1e293b; }

  /* ── MANUAL INPUT ── */
  .csq-manual { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
  .csq-manual-input {
    flex: 1; height: 48px; padding: 0 1rem;
    border: 1.5px solid #e2e8f0; border-radius: 14px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    background: #fff; color: #1e293b; outline: none; transition: all 0.2s;
  }
  .dark .csq-manual-input { background: #0f172a; color: #fff; border-color: #1e293b; }
  .csq-manual-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
  .csq-manual-btn {
    height: 48px; padding: 0 1.25rem;
    background: #0f172a; border: none; border-radius: 14px;
    font-size: 14px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .csq-manual-btn:hover { background: #1e293b; }
  .csq-manual-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── STATES ── */
  .csq-state-card {
    border-radius: 20px;
    padding: 1.75rem;
    margin-bottom: 1.5rem;
    animation: csq-in 0.35s ease-out;
  }
  .csq-state-loading { background: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
  .dark .csq-state-loading { background: #0f172a; border-color: #1e293b; }
  .csq-state-error { background: #fef2f2; border: 1.5px solid #fecaca; }
  .csq-state-success { background: #fff; border: 1.5px solid #e2e8f0; }
  .dark .csq-state-success { background: #0f172a; border-color: #1e293b; }

  .csq-spin { animation: csq-spin 1s linear infinite; }
  @keyframes csq-spin { to { transform: rotate(360deg); } }

  /* ── QR DETAIL ── */
  .csq-qr-header {
    display: flex; align-items: center; gap: 14px;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1.25rem;
  }
  .dark .csq-qr-header { border-color: #1e293b; }
  .csq-qr-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .csq-qr-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; }
  .dark .csq-qr-title { color: #f1f5f9; }
  .csq-qr-valid { font-size: 12px; font-weight: 600; color: #16a34a; display: flex; align-items: center; gap: 4px; margin-top: 3px; }

  .csq-detail-rows { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
  .csq-detail-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    background: #f8fafc; border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  .dark .csq-detail-row { background: #1e293b; border-color: #334155; }
  .csq-detail-key { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 6px; }
  .csq-detail-val { font-size: 14px; font-weight: 700; color: #0f172a; }
  .dark .csq-detail-val { color: #f1f5f9; }
  .csq-detail-val.montant {
    font-family: 'Sora', sans-serif;
    font-size: 20px; color: #2563eb;
  }

  .csq-balance-info {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.875rem 1rem;
    background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;
    margin-bottom: 1.5rem;
    font-size: 13px; font-weight: 600;
  }
  .csq-balance-info.low { background: #fef2f2; border-color: #fecaca; color: #991b1b; }

  .csq-confirm-btn {
    width: 100%; height: 52px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; border-radius: 14px;
    font-size: 16px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 6px 20px rgba(37,99,235,.3);
  }
  .csq-confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,.4); }
  .csq-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .csq-cancel-btn {
    width: 100%; height: 44px; margin-top: 0.75rem;
    background: none; border: 1.5px solid #e2e8f0;
    border-radius: 14px; font-size: 14px; font-weight: 600;
    color: #64748b; cursor: pointer; transition: all 0.2s;
  }
  .csq-cancel-btn:hover { border-color: #94a3b8; color: #334155; }
  .dark .csq-cancel-btn { border-color: #334155; color: #94a3b8; }

  /* ── SUCCESS ── */
  .csq-success-card {
    text-align: center; padding: 2.5rem 1.5rem;
    border-radius: 20px;
    background: #fff; border: 1.5px solid #e2e8f0;
    animation: csq-in 0.4s ease-out;
  }
  .dark .csq-success-card { background: #0f172a; border-color: #1e293b; }
  .csq-success-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #f0fdf4; border: 3px solid #86efac;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.25rem;
  }
  .csq-success-title { font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
  .dark .csq-success-title { color: #f1f5f9; }
  .csq-success-sub { font-size: 14px; color: #64748b; }
  .csq-success-amount { font-family: 'Sora', sans-serif; font-size: 34px; font-weight: 800; color: #2563eb; margin: 1rem 0; }
  .csq-new-btn {
    margin-top: 1.5rem; height: 48px; padding: 0 2rem;
    background: #2563eb; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.2s;
  }
  .csq-new-btn:hover { background: #1d4ed8; }
`;

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

/* ── Lecture QR depuis une image (jsQR via canvas) ── */
async function readQRFromImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      // Utilisation de jsQR (importé dynamiquement)
      import('jsqr').then(({ default: jsQR }) => {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) resolve(code.data);
        else reject(new Error('Aucun QR Code détecté dans cette image. Vérifiez la qualité de l\'image.'));
      }).catch(() => reject(new Error('Erreur lors du chargement du lecteur QR.')));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de charger l\'image.'));
    };
    img.src = url;
  });
}

// ── États du composant ──────────────────────────────────────────────────────
const STEP = {
  IDLE: 'idle',
  READING: 'reading',
  VALIDATING: 'validating',
  CONFIRM: 'confirm',
  PAYING: 'paying',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function ClientScanQR() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(STEP.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualId, setManualId] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Données QR validé
  const [qrInfo, setQrInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [payResult, setPayResult] = useState(null);

  const handleError = (msg) => {
    setErrorMsg(msg);
    setStep(STEP.ERROR);
  };

  const validateQR = useCallback(async (qrCodeId) => {
    const id = parseInt(qrCodeId, 10);
    if (isNaN(id) || id <= 0) {
      handleError('Identifiant QR invalide. Vérifiez l\'image ou saisissez un identifiant valide.');
      return;
    }

    setStep(STEP.VALIDATING);
    try {
      const [validation, bal] = await Promise.allSettled([
        qrCodeService.validate(id),
        clientService.getBalance(),
      ]);

      if (validation.status === 'rejected') throw validation.reason;

      const data = validation.value;
      if (!data || data.valide === false) {
        handleError(data?.message || 'Ce QR Code est invalide, expiré ou déjà utilisé.');
        return;
      }

      setQrInfo({ ...data, qrCodeId: id });
      if (bal.status === 'fulfilled') setBalance(bal.value);
      setStep(STEP.CONFIRM);
    } catch (err) {
      handleError(err?.response?.data?.message || err?.message || 'Erreur lors de la validation du QR Code.');
    }
  }, []);

  const handleFileChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez importer une image (PNG, JPG, JPEG).');
      return;
    }
    setStep(STEP.READING);
    try {
      const qrData = await readQRFromImage(file);
      toast.success('QR Code détecté !');
      await validateQR(qrData);
    } catch (err) {
      handleError(err.message || 'Lecture QR échouée.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleManualValidate = () => {
    const trimmed = manualId.trim();
    if (!trimmed) { toast.error('Saisissez un identifiant QR.'); return; }
    validateQR(trimmed);
  };

  const handleConfirmPayment = async () => {
    if (!qrInfo) return;
    setStep(STEP.PAYING);
    try {
      const result = await paymentService.virtualPayment({
        qrCodeId: qrInfo.qrCodeId,
        montant: qrInfo.montant,
      });
      setPayResult(result);
      setStep(STEP.SUCCESS);
      toast.success('Paiement effectué avec succès !');
    } catch (err) {
      handleError(err?.response?.data?.message || 'Le paiement a échoué. Vérifiez votre solde.');
    }
  };

  const handleReset = () => {
    setStep(STEP.IDLE);
    setQrInfo(null);
    setBalance(null);
    setPayResult(null);
    setErrorMsg('');
    setManualId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insufficient = balance !== null && qrInfo?.montant > balance;

  return (
    <div className="csq-root">
      <style>{CSS}</style>

      {/* ── IDLE : Zone d'import ── */}
      {step === STEP.IDLE && (
        <>
          <div
            className={`csq-upload-zone${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
            <div className="csq-upload-icon">
              <Upload size={32} color="#2563eb" />
            </div>
            <div className="csq-upload-title">Importer une image QR Code</div>
            <div className="csq-upload-sub">Glissez-déposez ou cliquez pour sélectionner</div>
            <div className="csq-upload-formats">Formats acceptés : PNG, JPG, JPEG, WEBP</div>
          </div>

          <div className="csq-divider">ou saisir manuellement</div>

          <div className="csq-manual">
            <input
              className="csq-manual-input"
              placeholder="Identifiant QR (ex: 42)"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualValidate()}
            />
            <button
              className="csq-manual-btn"
              onClick={handleManualValidate}
              disabled={!manualId.trim()}
            >
              <ArrowRight size={16} />
              Valider
            </button>
          </div>
        </>
      )}

      {/* ── READING ── */}
      {step === STEP.READING && (
        <div className="csq-state-card csq-state-loading">
          <Loader2 size={36} color="#2563eb" className="csq-spin" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>Lecture du QR Code…</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Analyse de l'image en cours</div>
        </div>
      )}

      {/* ── VALIDATING ── */}
      {step === STEP.VALIDATING && (
        <div className="csq-state-card csq-state-loading">
          <Loader2 size={36} color="#2563eb" className="csq-spin" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>Validation du QR Code…</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Vérification auprès du serveur</div>
        </div>
      )}

      {/* ── ERROR ── */}
      {step === STEP.ERROR && (
        <div className="csq-state-card csq-state-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <AlertTriangle size={24} color="#dc2626" />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#991b1b' }}>Erreur</span>
          </div>
          <p style={{ fontSize: 14, color: '#7f1d1d', marginBottom: '1.25rem', lineHeight: 1.6 }}>{errorMsg}</p>
          <button
            onClick={handleReset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.625rem 1.25rem',
              background: '#dc2626', border: 'none', borderRadius: 10,
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}
          >
            <X size={14} /> Réessayer
          </button>
        </div>
      )}

      {/* ── CONFIRM ── */}
      {step === STEP.CONFIRM && qrInfo && (
        <div className="csq-state-card csq-state-success">
          <div className="csq-qr-header">
            <div className="csq-qr-icon">
              <ScanLine size={24} color="white" />
            </div>
            <div>
              <div className="csq-qr-title">QR Code valide</div>
              <div className="csq-qr-valid"><CheckCircle2 size={12} /> Vérifié et authentique</div>
            </div>
          </div>

          <div className="csq-detail-rows">
            <div className="csq-detail-row">
              <span className="csq-detail-key"><Tag size={14} /> Montant à payer</span>
              <span className="csq-detail-val montant">{formatMoney(qrInfo.montant)}</span>
            </div>
            {qrInfo.description && (
              <div className="csq-detail-row">
                <span className="csq-detail-key"><Store size={14} /> Description</span>
                <span className="csq-detail-val">{qrInfo.description}</span>
              </div>
            )}
            <div className="csq-detail-row">
              <span className="csq-detail-key"><Hash size={14} /> Référence QR</span>
              <span className="csq-detail-val">#{qrInfo.qrCodeId}</span>
            </div>
            {qrInfo.dateExpiration && (
              <div className="csq-detail-row">
                <span className="csq-detail-key"><Calendar size={14} /> Expire le</span>
                <span className="csq-detail-val">{formatDate(qrInfo.dateExpiration)}</span>
              </div>
            )}
          </div>

          {balance !== null && (
            <div className={`csq-balance-info${insufficient ? ' low' : ''}`}>
              <span>Votre solde disponible</span>
              <strong style={{ fontSize: 15 }}>{formatMoney(balance)}</strong>
            </div>
          )}

          {insufficient && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
              padding: '0.75rem 1rem', fontSize: 13, color: '#991b1b',
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem'
            }}>
              <AlertTriangle size={14} />
              Solde insuffisant. Rechargez votre compte avant de payer.
            </div>
          )}

          <button
            className="csq-confirm-btn"
            onClick={handleConfirmPayment}
            disabled={insufficient}
          >
            <CheckCircle2 size={18} />
            Confirmer le paiement — {formatMoney(qrInfo.montant)}
          </button>
          <button className="csq-cancel-btn" onClick={handleReset}>
            Annuler
          </button>
        </div>
      )}

      {/* ── PAYING ── */}
      {step === STEP.PAYING && (
        <div className="csq-state-card csq-state-loading">
          <Loader2 size={36} color="#2563eb" className="csq-spin" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>Paiement en cours…</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Débit de votre solde virtuel</div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {step === STEP.SUCCESS && (
        <div className="csq-success-card">
          <div className="csq-success-icon">
            <CheckCircle2 size={36} color="#16a34a" />
          </div>
          <div className="csq-success-title">Paiement réussi !</div>
          <div className="csq-success-sub">Votre paiement a été effectué avec succès</div>
          <div className="csq-success-amount">{formatMoney(qrInfo?.montant)}</div>
          {qrInfo?.description && (
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: '0.5rem' }}>
              Pour : <strong>{qrInfo.description}</strong>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <button className="csq-new-btn" onClick={handleReset}>
              Nouveau paiement
            </button>
            <button
              className="csq-new-btn"
              onClick={() => navigate('/clients/transactions')}
              style={{ background: '#f1f5f9', color: '#1e293b' }}
            >
              Voir l'historique
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
