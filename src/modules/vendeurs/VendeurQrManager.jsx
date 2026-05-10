import { useState, useEffect, useCallback } from 'react';
import { qrCodeService } from '../../api/qrCodeService';
import toast from 'react-hot-toast';
import {
  QrCode as QrCodeIcon, Plus, X, AlertTriangle,
  CheckCircle2, Trash2, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/* ── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .vq-root { animation: vq-in 0.3s ease-out; }
  @keyframes vq-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  /* ── FORM CARD ── */
  .vq-form-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    padding: 1.75rem;
    margin-bottom: 2rem;
  }
  .dark .vq-form-card { background: #0f172a; border-color: #1e293b; }

  .vq-form-title {
    font-family: 'Sora', sans-serif;
    font-size: 17px; font-weight: 800;
    color: #0f172a; margin-bottom: 1.25rem;
    display: flex; align-items: center; gap: 10px;
  }
  .dark .vq-form-title { color: #f1f5f9; }

  .vq-label {
    font-size: 13px; font-weight: 700;
    color: #334155; margin-bottom: 6px; display: block;
  }
  .dark .vq-label { color: #94a3b8; }

  .vq-input {
    width: 100%; height: 48px;
    padding: 0 1rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 15px; font-family: 'Inter', sans-serif;
    color: #1e293b; background: #f8fafc;
    transition: all 0.2s; outline: none;
  }
  .dark .vq-input { background: #1e293b; color: #fff; border-color: #334155; }
  .vq-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  .vq-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; align-items: end; }
  @media (max-width: 640px) { .vq-row { grid-template-columns: 1fr 1fr; } }

  .vq-field { display: flex; flex-direction: column; gap: 6px; }

  .vq-add-product {
    display: flex; align-items: center; gap: 6px;
    padding: 0.65rem 1rem;
    background: #f8fafc; border: 1.5px dashed #cbd5e1;
    border-radius: 10px; cursor: pointer;
    font-size: 13px; font-weight: 600; color: #64748b;
    transition: all 0.15s; margin-top: 0.5rem;
    width: 100%;
  }
  .vq-add-product:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

  .vq-remove-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border-radius: 8px; border: none;
    background: #fef2f2; cursor: pointer;
    color: #dc2626; transition: all 0.15s;
  }
  .vq-remove-btn:hover { background: #fee2e2; }

  .vq-total-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border-radius: 12px; margin: 1rem 0;
    border: 1px solid #bfdbfe;
  }
  .vq-total-label { font-size: 14px; font-weight: 600; color: #1e40af; }
  .vq-total-val {
    font-family: 'Sora', sans-serif;
    font-size: 22px; font-weight: 800; color: #1d4ed8;
  }

  .vq-submit {
    width: 100%; height: 52px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; border-radius: 14px;
    font-size: 15px; font-weight: 700; color: #fff;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 6px 20px rgba(37,99,235,.3);
  }
  .vq-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,99,235,.4); }
  .vq-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .vq-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── QR RESULT MODAL ── */
  .vq-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    z-index: 100; display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: vq-in 0.2s;
  }
  .vq-modal {
    background: #fff; border-radius: 24px;
    padding: 2rem; max-width: 380px; width: 100%;
    position: relative; text-align: center;
    box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  }
  .vq-modal-close {
    position: absolute; top: 1rem; right: 1rem;
    width: 32px; height: 32px;
    border-radius: 50%; border: none;
    background: #f1f5f9; cursor: pointer; color: #64748b;
    display: flex; align-items: center; justify-content: center;
  }
  .vq-modal-success-icon {
    width: 64px; height: 64px;
    background: #f0fdf4; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
  }
  .vq-modal-title { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
  .vq-modal-amount { font-family: 'Sora', sans-serif; font-size: 32px; font-weight: 800; color: #2563eb; margin-bottom: 0.5rem; }
  .vq-modal-sub { font-size: 13px; color: #64748b; margin-bottom: 1.5rem; }
  .vq-modal-qr {
    width: 180px; height: 180px; margin: 0 auto 1.25rem;
    background: #f8fafc; border-radius: 16px;
    border: 2px dashed #e2e8f0;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── QR GRID ── */
  .vq-list-header {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 800;
    color: #0f172a; margin-bottom: 1rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark .vq-list-header { color: #f1f5f9; }

  .vq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .vq-qr-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0; padding: 1.25rem;
    transition: all 0.2s; cursor: pointer;
  }
  .dark .vq-qr-card { background: #0f172a; border-color: #1e293b; }
  .vq-qr-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }

  .vq-qr-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .vq-qr-icon {
    width: 40px; height: 40px;
    border-radius: 12px; background: #eff6ff;
    display: flex; align-items: center; justify-content: center;
  }
  .vq-badge {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px;
  }
  .vq-badge-active  { background: #f0fdf4; color: #16a34a; }
  .vq-badge-used    { background: #eff6ff; color: #2563eb; }
  .vq-badge-expired { background: #fef2f2; color: #dc2626; }

  .vq-qr-desc { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
  .dark .vq-qr-desc { color: #e2e8f0; }
  .vq-qr-amount { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #2563eb; }
  .vq-qr-date { font-size: 11px; color: #94a3b8; margin-top: 6px; }

  .vq-empty {
    text-align: center; padding: 3rem;
    color: #94a3b8; font-size: 14px;
    background: #fff; border-radius: 16px; border: 1px dashed #e2e8f0;
  }
  .dark .vq-empty { background: #0f172a; border-color: #1e293b; }

  .vq-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 0.5rem 1rem; border-radius: 10px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    font-size: 13px; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s;
  }
  .vq-refresh-btn:hover { background: #e2e8f0; }

  .vq-desc-input {
    width: 100%; padding: 0.65rem 1rem;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 15px; background: #f8fafc;
    resize: none; outline: none; font-family: 'Inter', sans-serif;
    color: #1e293b; transition: all 0.2s;
  }
  .dark .vq-desc-input { background: #1e293b; color: #fff; border-color: #334155; }
  .vq-desc-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  .vq-date-input {
    width: 100%; height: 48px;
    padding: 0 1rem;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    font-size: 15px; font-family: 'Inter', sans-serif;
    color: #1e293b; background: #f8fafc;
    outline: none; transition: all 0.2s;
  }
  .vq-date-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }

  .vq-divider {
    height: 1px; background: #f1f5f9;
    margin: 1.25rem 0;
  }
  .dark .vq-divider { background: #1e293b; }

  .vq-products-title {
    font-size: 13px; font-weight: 700;
    color: #475569; margin-bottom: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.05em;
  }

  /* ── 403 ERROR BANNER ── */
  .vq-error-banner {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 1.25rem 1.5rem;
    background: #fffbeb; border: 1.5px solid #fde68a;
    border-radius: 16px; margin-bottom: 1.5rem;
  }
  .vq-error-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #fef3c7; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .vq-error-title { font-size: 14px; font-weight: 700; color: #92400e; margin-bottom: 4px; }
  .vq-error-body { font-size: 13px; color: #78350f; line-height: 1.5; }
  .vq-error-code {
    display: inline-block; font-family: monospace;
    background: #fde68a; color: #78350f; font-size: 12px;
    padding: 2px 8px; border-radius: 6px; margin-top: 6px;
  }

  /* ── PRODUCTS LIST IN MODAL ── */
  .vq-modal-products {
    background: #f8fafc; border-radius: 12px; padding: 12px;
    margin-bottom: 1.5rem; max-height: 140px; overflow-y: auto; 
    border: 1px solid #e2e8f0; text-align: left;
  }
  .vq-modal-product-item {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; color: #475569; padding: 6px 0; border-bottom: 1px solid #f1f5f9;
  }
  .vq-modal-product-item:last-child { border-bottom: none; }
  .vq-modal-product-qty { font-weight: 700; color: #0f172a; margin-right: 8px; }
  .vq-modal-product-price { font-weight: 600; color: #0f172a; }
`;

function formatMoney(v) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v ?? 0) + ' XAF';
}

function formatDateShort(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getQrStatus(qr) {
  if (qr.estUtilise) return 'used';
  if (qr.dateExpiration && new Date(qr.dateExpiration) < new Date()) return 'expired';
  return 'active';
}

const DEFAULT_PRODUCT = { nom: '', prix: '', quantite: 1 };

// Default expiration: 24h from now
function defaultExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 16);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function VendeurQrManager() {
  const [products, setProducts] = useState([{ ...DEFAULT_PRODUCT }]);
  const [description, setDescription] = useState('');
  const [dateExpiration, setDateExpiration] = useState(defaultExpiry());
  const [generating, setGenerating] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);
  const [selectedQr, setSelectedQr] = useState(null);

  const [qrList, setQrList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [qrError, setQrError] = useState(null); // null | '403' | 'network'

  const loadQrs = useCallback(async () => {
    setLoadingList(true);
    setQrError(null);
    try {
      const items = await qrCodeService.getMyQrCodes();
      setQrList(Array.isArray(items) ? items : []);
    } catch (err) {
      const status = err?.response?.status ?? 0;
      if (status === 403) {
        setQrError('403');
      } else if (status === 401) {
        // Interceptor handles redirect
      } else {
        setQrError('network');
        // Use toast ID to avoid duplicate toasts (React StrictMode renders twice)
        toast.error('Erreur réseau : impossible de charger les QR Codes', { id: 'qr-load-error' });
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Run once on mount (strict mode safe)
  useEffect(() => { loadQrs(); }, [loadQrs]);

  const updateProduct = (i, field, value) => {
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const addProduct = () => setProducts(prev => [...prev, { ...DEFAULT_PRODUCT }]);
  const removeProduct = (i) => setProducts(prev => prev.filter((_, idx) => idx !== i));

  const total = products.reduce((s, p) => s + (parseFloat(p.prix) || 0) * (parseInt(p.quantite) || 0), 0);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (products.some(p => !p.nom || !p.prix)) {
      return toast.error('Remplissez tous les champs produits');
    }
    if (total <= 0) return toast.error('Le montant doit être positif');

    setGenerating(true);
    try {
      const payload = {
        products: products.map(p => ({
          nom: p.nom,
          prix: parseFloat(p.prix),
          quantite: parseInt(p.quantite) || 1,
        })),
        description,
        dateExpiration: new Date(dateExpiration).toISOString(),
      };
      const result = await qrCodeService.generate(payload);
      setGeneratedQr({ ...result, montantTotal: total });
      toast.success('QR Code généré avec succès !');
      loadQrs();
      // Reset form
      setProducts([{ ...DEFAULT_PRODUCT }]);
      setDescription('');
      setDateExpiration(defaultExpiry());
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="vq-root">
      <style>{CSS}</style>

      {/* ── GENERATE FORM ── */}
      <div className="vq-form-card">
        <div className="vq-form-title">
          <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCodeIcon size={18} color="#2563eb" />
          </div>
          Créer un nouveau QR Code
        </div>

        <form onSubmit={handleGenerate}>
          {/* Products */}
          <div className="vq-products-title">Produits / Services</div>

          {products.map((p, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <div className="vq-row">
                <div className="vq-field" style={{ gridColumn: '1 / 2' }}>
                  <label className="vq-label">Désignation</label>
                  <input
                    className="vq-input"
                    placeholder="Ex: Burger + Frites"
                    value={p.nom}
                    onChange={e => updateProduct(i, 'nom', e.target.value)}
                    required
                  />
                </div>
                <div className="vq-field">
                  <label className="vq-label">Prix (XAF)</label>
                  <input
                    className="vq-input"
                    type="number" min="1" placeholder="5000"
                    value={p.prix}
                    onChange={e => updateProduct(i, 'prix', e.target.value)}
                    required
                  />
                </div>
                <div className="vq-field" style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="vq-label">Qté</label>
                    <input
                      className="vq-input" type="number" min="1"
                      value={p.quantite}
                      onChange={e => updateProduct(i, 'quantite', e.target.value)}
                    />
                  </div>
                  {products.length > 1 && (
                    <button type="button" className="vq-remove-btn" onClick={() => removeProduct(i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="vq-add-product" onClick={addProduct}>
            <Plus size={14} /> Ajouter un produit
          </button>

          <div className="vq-divider" />

          {/* Description & Expiration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="vq-field">
              <label className="vq-label">Description (optionnel)</label>
              <input
                className="vq-input"
                placeholder="Facture #12, Table 3..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="vq-field">
              <label className="vq-label">Expire le</label>
              <input
                className="vq-date-input"
                type="datetime-local"
                value={dateExpiration}
                onChange={e => setDateExpiration(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Total */}
          <div className="vq-total-row">
            <span className="vq-total-label">Montant Total à encaisser</span>
            <span className="vq-total-val">{formatMoney(total)}</span>
          </div>

          <button type="submit" className="vq-submit" disabled={generating || total <= 0}>
            {generating ? (
              <><div className="vq-spinner" /> Génération en cours…</>
            ) : (
              <><QrCodeIcon size={18} /> Générer le QR Code</>
            )}
          </button>
        </form>
      </div>

      {/* ── QR LIST ── */}
      <div className="vq-list-header">
        Mes QR Codes ({qrList.length})
        <button className="vq-refresh-btn" onClick={loadQrs}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* 403 Banner - backend authority bug */}
      {qrError === '403' && (
        <div className="vq-error-banner">
          <div className="vq-error-icon"><AlertTriangle size={18} color="#d97706" /></div>
          <div>
            <div className="vq-error-title">Erreur d'autorisation backend (403)</div>
            <div className="vq-error-body">
              Le backend utilise <code>hasAuthority('VENDEUR')</code> dans <strong>QRCodeController</strong>,
              mais le JWT génère l'autorité <strong>ROLE_VENDEUR</strong> (avec préfixe ROLE_).
              <br />La liste des QR Codes est inaccessible tant que cette incohérence n'est pas corrigée.
              <br />
              <span className="vq-error-code">
                @PreAuthorize("hasAuthority('VENDEUR')") → corriger en hasAuthority('ROLE_VENDEUR')
              </span>
            </div>
          </div>
        </div>
      )}

      {loadingList ? (
        <div className="vq-empty">Chargement…</div>
      ) : qrError === '403' ? (
        <div className="vq-empty">
          <AlertTriangle size={32} style={{ color: '#d97706', display: 'block', margin: '0 auto 8px' }} />
          Inaccessible — Bug d'autorisation côté backend
        </div>
      ) : qrList.length === 0 ? (
        <div className="vq-empty">
          <QrCodeIcon size={32} style={{ marginBottom: 8, opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
          Aucun QR Code généré pour l'instant
        </div>
      ) : (
        <div className="vq-grid">
          {qrList.map((qr, i) => {
            const status = getQrStatus(qr);
            return (
              <div key={qr.id || i} className="vq-qr-card" onClick={() => setSelectedQr(qr)}>
                <div className="vq-qr-top">
                  <div className="vq-qr-icon"><QrCodeIcon size={18} color="#2563eb" /></div>
                  <span className={`vq-badge vq-badge-${status}`}>
                    {status === 'active' ? '● Actif' : status === 'used' ? '✓ Utilisé' : '✕ Expiré'}
                  </span>
                </div>
                <div className="vq-qr-desc">{qr.description || 'Paiement QR'}</div>
                <div className="vq-qr-amount">{formatMoney(qr.montant)}</div>
                <div className="vq-qr-date">
                  Créé le {formatDateShort(qr.dateCreation)}
                  {qr.dateExpiration && <> · Expire le {formatDateShort(qr.dateExpiration)}</>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL SUCCESS ── */}
      {generatedQr && (
        <div className="vq-modal-overlay" onClick={() => setGeneratedQr(null)}>
          <div className="vq-modal" onClick={e => e.stopPropagation()}>
            <button className="vq-modal-close" onClick={() => setGeneratedQr(null)}><X size={16} /></button>
            <div className="vq-modal-success-icon">
              <CheckCircle2 size={32} color="#16a34a" />
            </div>
            <div className="vq-modal-title">QR Code Prêt !</div>
            <div className="vq-modal-amount">{formatMoney(generatedQr.montantTotal)}</div>
            <div className="vq-modal-sub">{generatedQr.description || 'Présentez ce QR au client pour encaisser'}</div>
            <div className="vq-modal-qr">
              <QRCodeSVG 
                value={generatedQr.qrCodeData || `QR-${generatedQr.id}`} 
                size={150} 
                level="M"
                includeMargin={false}
              />
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: '16px' }}>
              ID: #{generatedQr.qrCodeId || generatedQr.id}
            </p>
          </div>
        </div>
      )}

      {/* ── MODAL DETAILS ── */}
      {selectedQr && (
        <div className="vq-modal-overlay" onClick={() => setSelectedQr(null)}>
          <div className="vq-modal" onClick={e => e.stopPropagation()}>
            <button className="vq-modal-close" onClick={() => setSelectedQr(null)}><X size={16} /></button>
            <div className="vq-modal-title" style={{ marginTop: '1rem' }}>Détails du QR Code</div>
            
            <div className="vq-modal-qr">
              <QRCodeSVG 
                value={selectedQr.qrCodeData || `QR-${selectedQr.id}`} 
                size={150} 
                level="M"
                includeMargin={false}
              />
            </div>
            
            <div className="vq-modal-amount">{formatMoney(selectedQr.montant)}</div>
            <div className="vq-modal-sub" style={{ marginBottom: '1rem' }}>
              {selectedQr.description || 'Paiement générique'}
            </div>

            {/* Parsing JSON Payload for Products */}
            {(() => {
              let products = [];
              if (selectedQr.qrCodeData && selectedQr.qrCodeData.startsWith('{')) {
                try {
                  const data = JSON.parse(selectedQr.qrCodeData);
                  if (data.products && Array.isArray(data.products)) {
                    products = data.products;
                  }
                } catch (err) { /* ignore parse error */ }
              }
              if (products.length > 0) {
                return (
                  <div className="vq-modal-products">
                    {products.map((p, idx) => (
                      <div key={idx} className="vq-modal-product-item">
                        <div>
                          <span className="vq-modal-product-qty">{p.quantite}x</span>
                          {p.nom}
                        </div>
                        <div className="vq-modal-product-price">{formatMoney(p.prix * p.quantite)}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span className={`vq-badge vq-badge-${getQrStatus(selectedQr)}`}>
                {getQrStatus(selectedQr) === 'active' ? '● Actif' : getQrStatus(selectedQr) === 'used' ? '✓ Utilisé' : '✕ Expiré'}
              </span>
            </div>
            
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
              Créé le : {new Date(selectedQr.dateCreation).toLocaleString('fr-FR')}<br />
              Expire le : {selectedQr.dateExpiration ? new Date(selectedQr.dateExpiration).toLocaleString('fr-FR') : 'Jamais'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
