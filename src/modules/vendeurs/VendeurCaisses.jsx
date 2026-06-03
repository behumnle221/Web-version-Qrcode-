import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, UserX, UserCheck, Shield, Trash2, X,
  TrendingUp, QrCode, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vendeurService } from '../../api/vendeurService';

/* ─── Indicateur de force du mot de passe ─── */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { score: 0, label: '', color: '#e2e8f0' },
    { score: 1, label: 'Très faible', color: '#ef4444' },
    { score: 2, label: 'Faible', color: '#f97316' },
    { score: 3, label: 'Moyen', color: '#eab308' },
    { score: 4, label: 'Fort', color: '#22c55e' },
  ];
  return levels[score];
}

function isPasswordValid(pwd) {
  return pwd && pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
}

/* ─── CSS inline ─── */
const CSS = `
  .vc-root { padding: 0; }

  .vc-hero {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .vc-hero-left h1 {
    font-size: 22px; font-weight: 800; color: #f1f5f9;
    margin: 0 0 6px 0; font-family: 'Sora', sans-serif;
  }
  .vc-hero-left p { margin: 0; font-size: 14px; color: #94a3b8; }
  .vc-hero-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px; border: none;
    background: #2563eb; color: #fff;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(37,99,235,.3);
    white-space: nowrap;
  }
  .vc-hero-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

  .vc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .vc-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .vc-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .dark .vc-card { background: #1e293b; border-color: #334155; }
  .vc-card.suspended { opacity: 0.7; }

  .vc-card-top {
    padding: 20px 20px 16px;
    display: flex; align-items: center; gap: 14px;
    border-bottom: 1px solid #f1f5f9;
  }
  .dark .vc-card-top { border-color: #334155; }
  .vc-avatar {
    width: 48px; height: 48px; border-radius: 12px;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 800; color: #fff;
    flex-shrink: 0;
  }
  .vc-card-info { flex: 1; min-width: 0; }
  .vc-card-name {
    font-size: 15px; font-weight: 700; color: #0f172a;
    margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dark .vc-card-name { color: #f1f5f9; }
  .vc-card-email { font-size: 12px; color: #64748b; margin: 0; }
  .vc-badge {
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
    flex-shrink: 0;
  }
  .vc-badge.active { background: #dcfce7; color: #16a34a; }
  .vc-badge.inactive { background: #fee2e2; color: #dc2626; }

  .vc-card-stats {
    padding: 16px 20px;
    display: flex; gap: 16px;
  }
  .vc-stat {
    flex: 1; text-align: center;
    padding: 12px 8px; border-radius: 10px;
    background: #f8fafc;
  }
  .dark .vc-stat { background: #0f172a; }
  .vc-stat-val {
    font-size: 16px; font-weight: 800; color: #0f172a;
    margin: 0 0 2px;
  }
  .dark .vc-stat-val { color: #f1f5f9; }
  .vc-stat-lbl { font-size: 11px; color: #64748b; margin: 0; }

  .vc-card-actions {
    padding: 12px 20px;
    border-top: 1px solid #f1f5f9;
    display: flex; gap: 8px;
    justify-content: flex-end;
  }
  .dark .vc-card-actions { border-color: #334155; }
  .vc-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px; border: none;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: all 0.15s;
  }
  .vc-btn-toggle-off { background: #fee2e2; color: #dc2626; }
  .vc-btn-toggle-off:hover { background: #fecaca; }
  .vc-btn-toggle-on { background: #dcfce7; color: #16a34a; }
  .vc-btn-toggle-on:hover { background: #bbf7d0; }
  .vc-btn-delete { background: #f1f5f9; color: #64748b; }
  .vc-btn-delete:hover { background: #fee2e2; color: #dc2626; }

  .vc-empty {
    text-align: center; padding: 80px 20px;
    background: #fff; border-radius: 16px;
    border: 2px dashed #e2e8f0;
  }
  .dark .vc-empty { background: #1e293b; border-color: #334155; }
  .vc-empty svg { color: #cbd5e1; margin-bottom: 16px; }
  .vc-empty h3 { font-size: 18px; color: #0f172a; margin: 0 0 8px; }
  .dark .vc-empty h3 { color: #f1f5f9; }
  .vc-empty p { font-size: 14px; color: #64748b; margin: 0; max-width: 360px; display: inline-block; }

  /* ─── MODAL ─── */
  .vc-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 16px;
    animation: vcFadeIn 0.15s;
  }
  @keyframes vcFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .vc-modal {
    background: #fff; border-radius: 20px;
    width: 100%; max-width: 460px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: vcSlideUp 0.2s ease-out;
  }
  .dark .vc-modal { background: #1e293b; }
  @keyframes vcSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .vc-modal-head {
    padding: 24px 24px 0;
    display: flex; align-items: center; justify-content: space-between;
  }
  .vc-modal-head h3 {
    font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;
    font-family: 'Sora', sans-serif;
  }
  .dark .vc-modal-head h3 { color: #f1f5f9; }
  .vc-modal-close {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: #f1f5f9; cursor: pointer; color: #64748b;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .vc-modal-close:hover { background: #e2e8f0; }

  .vc-form { padding: 20px 24px 24px; }
  .vc-field { margin-bottom: 16px; }
  .vc-field label {
    display: block; font-size: 12px; font-weight: 600;
    color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .vc-field input {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid #e2e8f0; font-size: 14px;
    background: #f8fafc; color: #0f172a;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .dark .vc-field input { background: #0f172a; border-color: #334155; color: #f1f5f9; }
  .vc-field input:focus { outline: none; border-color: #2563eb; background: #fff; }
  .vc-pwd-wrap { position: relative; }
  .vc-pwd-wrap input { padding-right: 44px; }
  .vc-eye-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    border: none; background: none; cursor: pointer; color: #94a3b8; padding: 4px;
  }

  .vc-strength-bar {
    height: 4px; border-radius: 4px; margin-top: 8px;
    background: #e2e8f0; overflow: hidden;
  }
  .vc-strength-fill {
    height: 100%; border-radius: 4px;
    transition: width 0.3s, background-color 0.3s;
  }
  .vc-strength-label { font-size: 11px; margin-top: 4px; font-weight: 600; }

  .vc-hint {
    font-size: 11px; color: #94a3b8; margin-top: 4px;
  }

  .vc-modal-footer {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 0 24px 24px;
  }
  .vc-btn-cancel {
    padding: 10px 20px; border-radius: 10px; border: 1.5px solid #e2e8f0;
    background: none; color: #475569; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .vc-btn-cancel:hover { background: #f1f5f9; }
  .vc-btn-submit {
    padding: 10px 24px; border-radius: 10px; border: none;
    background: #2563eb; color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .vc-btn-submit:hover:not(:disabled) { background: #1d4ed8; }
  .vc-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ─── CONFIRM DELETE MODAL ─── */
  .vc-confirm-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: #fee2e2; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; color: #dc2626;
  }
  .vc-confirm-body { text-align: center; padding: 24px; }
  .vc-confirm-body h3 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
  .dark .vc-confirm-body h3 { color: #f1f5f9; }
  .vc-confirm-body p { font-size: 14px; color: #64748b; margin: 0; }
  .vc-btn-danger {
    padding: 10px 24px; border-radius: 10px; border: none;
    background: #dc2626; color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .vc-btn-danger:hover { background: #b91c1c; }

  .vc-loading {
    text-align: center; padding: 60px; color: #94a3b8; font-size: 14px;
  }
`;

const VendeurCaisses = () => {
  const [caisses, setCaisses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // caisse object
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nomCaisse: '', email: '', password: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendeurService.getCaisses();
      setCaisses(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement des caisses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isPasswordValid(form.password)) {
      toast.error('Mot de passe trop faible (min 8 caractères, 1 majuscule, 1 chiffre)');
      return;
    }
    setSubmitting(true);
    try {
      await vendeurService.createCaisse(form);
      toast.success('Caisse créée avec succès !');
      setShowCreate(false);
      setForm({ nomCaisse: '', email: '', password: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (caisse) => {
    try {
      await vendeurService.toggleCaisse(caisse.id);
      toast.success(caisse.actif ? 'Caisse suspendue' : 'Caisse activée');
      load();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await vendeurService.deleteCaisse(confirmDelete.id);
      toast.success('Caisse supprimée définitivement');
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const strength = getPasswordStrength(form.password);
  const pwdValid = isPasswordValid(form.password);

  const formatMontant = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString('fr-FR') + ' XAF';
  };

  const getInitial = (name) => (name || '?').charAt(0).toUpperCase();

  return (
    <>
      <style>{CSS}</style>
      <div className="vc-root">
        {/* Hero */}
        <div className="vc-hero">
          <div className="vc-hero-left">
            <h1>Gestion des Caisses</h1>
            <p>Créez des accès limités pour vos caissiers · {caisses.length} caisse(s) configurée(s)</p>
          </div>
          <button className="vc-hero-btn" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nouvelle Caisse
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="vc-loading">Chargement des caisses…</div>
        ) : caisses.length === 0 ? (
          <div className="vc-empty">
            <Shield size={56} />
            <h3>Aucune caisse configurée</h3>
            <p>Créez votre première caisse pour permettre à vos employés d'encaisser sans accéder à votre solde.</p>
          </div>
        ) : (
          <div className="vc-grid">
            {caisses.map((c) => (
              <div key={c.id} className={`vc-card${!c.actif ? ' suspended' : ''}`}>
                <div className="vc-card-top">
                  <div className="vc-avatar">{getInitial(c.nomCaisse)}</div>
                  <div className="vc-card-info">
                    <p className="vc-card-name">{c.nomCaisse}</p>
                    <p className="vc-card-email">{c.email}</p>
                  </div>
                  <span className={`vc-badge ${c.actif ? 'active' : 'inactive'}`}>
                    {c.actif ? 'Actif' : 'Suspendu'}
                  </span>
                </div>

                <div className="vc-card-stats">
                  <div className="vc-stat">
                    <p className="vc-stat-val" style={{ color: '#2563eb' }}>{formatMontant(c.totalVentes)}</p>
                    <p className="vc-stat-lbl">Total encaissé</p>
                  </div>
                  <div className="vc-stat">
                    <p className="vc-stat-val">{c.nombreQrGeneres ?? 0}</p>
                    <p className="vc-stat-lbl">QR générés</p>
                  </div>
                </div>

                <div className="vc-card-actions">
                  <button
                    className={`vc-btn ${c.actif ? 'vc-btn-toggle-off' : 'vc-btn-toggle-on'}`}
                    onClick={() => handleToggle(c)}
                  >
                    {c.actif ? <><UserX size={14} /> Suspendre</> : <><UserCheck size={14} /> Activer</>}
                  </button>
                  <button className="vc-btn vc-btn-delete" onClick={() => setConfirmDelete(c)}>
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL CRÉATION ── */}
      {showCreate && (
        <div className="vc-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="vc-modal">
            <div className="vc-modal-head">
              <h3>Nouvelle Caisse</h3>
              <button className="vc-modal-close" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="vc-form">
                <div className="vc-field">
                  <label>Nom de la caisse</label>
                  <input
                    type="text" required placeholder="ex: Caisse principale"
                    value={form.nomCaisse}
                    onChange={(e) => setForm({ ...form, nomCaisse: e.target.value })}
                  />
                </div>
                <div className="vc-field">
                  <label>Email de connexion</label>
                  <input
                    type="email" required placeholder="ex: caisse1@monmagasin.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="vc-field">
                  <label>Mot de passe</label>
                  <div className="vc-pwd-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'} required
                      placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button type="button" className="vc-eye-btn" onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <>
                      <div className="vc-strength-bar">
                        <div
                          className="vc-strength-fill"
                          style={{
                            width: `${(strength.score / 4) * 100}%`,
                            backgroundColor: strength.color
                          }}
                        />
                      </div>
                      <div className="vc-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </div>
                    </>
                  )}
                  <p className="vc-hint">Min. 8 caractères · 1 majuscule · 1 chiffre</p>
                </div>
              </div>
              <div className="vc-modal-footer">
                <button type="button" className="vc-btn-cancel" onClick={() => setShowCreate(false)}>
                  Annuler
                </button>
                <button type="submit" className="vc-btn-submit" disabled={submitting || !pwdValid}>
                  {submitting ? 'Création…' : 'Créer la caisse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMATION SUPPRESSION ── */}
      {confirmDelete && (
        <div className="vc-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="vc-modal">
            <div className="vc-confirm-body">
              <div className="vc-confirm-icon"><AlertTriangle size={28} /></div>
              <h3>Supprimer cette caisse ?</h3>
              <p>
                La caisse <strong>{confirmDelete.nomCaisse}</strong> ({confirmDelete.email}) sera supprimée
                définitivement. Cette action est irréversible.
              </p>
            </div>
            <div className="vc-modal-footer">
              <button className="vc-btn-cancel" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="vc-btn-danger" onClick={handleDelete}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendeurCaisses;
