import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, UserX, UserCheck, Trash2, X,
  Eye, EyeOff, AlertTriangle, Calendar,
  TrendingUp, ShoppingBag, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { vendeurService } from '../../api/vendeurService';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function fmt(v) {
  return (Number(v) || 0).toLocaleString('fr-FR') + ' XAF';
}
function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase();
}
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { score: 0, label: '',            color: '#e2e8f0' },
    { score: 1, label: 'Très faible', color: '#ef4444' },
    { score: 2, label: 'Faible',      color: '#f97316' },
    { score: 3, label: 'Moyen',       color: '#eab308' },
    { score: 4, label: 'Fort ✓',      color: '#22c55e' },
  ];
  return levels[score];
}
function isPasswordValid(pwd) {
  return pwd && pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
}

/* ─────────────────────────────────────────
   Filtre config
───────────────────────────────────────── */
const FILTRES = [
  { key: 'JOUR',    label: "Aujourd'hui",   icon: Calendar },
  { key: 'SEMAINE', label: 'Cette semaine', icon: Calendar },
  { key: 'MOIS',    label: 'Ce mois',       icon: Calendar },
  { key: 'TOUT',    label: 'Tout',          icon: TrendingUp },
];

/* ─────────────────────────────────────────
   Styles (CSS-in-JS)
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

.vc-root { padding: 0; font-family: 'Inter', sans-serif; }

/* ── Hero ── */
.vc-hero {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px; padding: 24px 28px; margin-bottom: 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.vc-hero-left h1 {
  font-family: 'Sora', sans-serif;
  font-size: 20px; font-weight: 800; color: #f1f5f9; margin: 0 0 4px;
}
.vc-hero-left p { margin: 0; font-size: 13px; color: #94a3b8; }
.vc-hero-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 10px; border: none;
  background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,.3); white-space: nowrap;
}
.vc-hero-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

/* ── Filtre buttons ── */
.vc-filters {
  display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
}
.vc-filter-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 30px;
  border: 1.5px solid #e2e8f0;
  background: #fff; color: #64748b;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.18s;
}
.vc-filter-btn:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.vc-filter-btn.active {
  background: #2563eb; border-color: #2563eb;
  color: #fff; box-shadow: 0 3px 10px rgba(37,99,235,.3);
}
.dark .vc-filter-btn { background: #1e293b; border-color: #334155; color: #94a3b8; }
.dark .vc-filter-btn:hover { border-color: #2563eb; color: #2563eb; background: #1e3a5f; }
.dark .vc-filter-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }

/* ── Total Banner ── */
.vc-total-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);
  border-radius: 14px; padding: 20px 24px;
  margin-bottom: 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  box-shadow: 0 6px 20px rgba(37,99,235,.25);
}
.vc-total-left { display: flex; align-items: center; gap: 14px; }
.vc-total-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
}
.vc-total-text p { margin: 0; }
.vc-total-label { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500; margin-bottom: 2px !important; }
.vc-total-amount { font-size: 26px; font-weight: 800; color: #fff; font-family: 'Sora', sans-serif; }
.vc-total-right { text-align: right; }
.vc-total-sub { font-size: 12px; color: rgba(255,255,255,0.65); margin: 0 0 2px; }
.vc-total-caisses { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }

/* ── Cards grid ── */
.vc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}
.vc-card {
  background: #fff; border-radius: 16px;
  border: 1px solid #e2e8f0; overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.vc-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.09); transform: translateY(-2px); }
.dark .vc-card { background: #1e293b; border-color: #334155; }
.vc-card.suspended { opacity: 0.65; }

/* Card top */
.vc-card-top {
  padding: 18px 18px 14px;
  display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.dark .vc-card-top { border-color: #334155; }
.vc-avatar {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; color: #fff; flex-shrink: 0;
}
.vc-card-info { flex: 1; min-width: 0; }
.vc-card-name {
  font-size: 14px; font-weight: 700; color: #0f172a;
  margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .vc-card-name { color: #f1f5f9; }
.vc-card-email { font-size: 11px; color: #64748b; margin: 0; }
.vc-badge {
  padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.vc-badge.active { background: #dcfce7; color: #16a34a; }
.vc-badge.inactive { background: #fee2e2; color: #dc2626; }

/* Card stats */
.vc-card-stats { padding: 16px 18px; display: flex; gap: 10px; }
.vc-stat {
  flex: 1; text-align: center; padding: 12px 6px;
  border-radius: 10px; background: #f8fafc;
}
.dark .vc-stat { background: #0f172a; }
.vc-stat-val {
  font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 2px;
}
.dark .vc-stat-val { color: #f1f5f9; }
.vc-stat-lbl { font-size: 10px; color: #64748b; margin: 0; line-height: 1.3; }

/* Période highlight */
.vc-period-stat {
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1px solid #bfdbfe;
}
.dark .vc-period-stat { background: linear-gradient(135deg, #1e3a5f, #14532d); border-color: #1d4ed8; }

/* Card actions */
.vc-card-actions {
  padding: 10px 18px; border-top: 1px solid #f1f5f9;
  display: flex; gap: 8px; justify-content: flex-end;
}
.dark .vc-card-actions { border-color: #334155; }
.vc-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.vc-btn-toggle-off { background: #fee2e2; color: #dc2626; }
.vc-btn-toggle-off:hover { background: #fecaca; }
.vc-btn-toggle-on { background: #dcfce7; color: #16a34a; }
.vc-btn-toggle-on:hover { background: #bbf7d0; }
.vc-btn-delete { background: #f1f5f9; color: #64748b; }
.vc-btn-delete:hover { background: #fee2e2; color: #dc2626; }

/* Empty */
.vc-empty {
  text-align: center; padding: 72px 20px;
  background: #fff; border-radius: 16px; border: 2px dashed #e2e8f0;
}
.dark .vc-empty { background: #1e293b; border-color: #334155; }
.vc-empty svg { color: #cbd5e1; margin-bottom: 14px; }
.vc-empty h3 { font-size: 17px; color: #0f172a; margin: 0 0 6px; }
.dark .vc-empty h3 { color: #f1f5f9; }
.vc-empty p { font-size: 13px; color: #64748b; margin: 0; max-width: 340px; display: inline-block; }
.vc-loading { text-align: center; padding: 60px; color: #94a3b8; font-size: 14px; }

/* ── MODAL base ── */
.vc-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px; animation: vcFadeIn 0.15s;
}
@keyframes vcFadeIn { from { opacity: 0; } to { opacity: 1; } }
.vc-modal {
  background: #fff; border-radius: 20px;
  width: 100%; max-width: 450px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: vcSlideUp 0.2s ease-out;
}
.dark .vc-modal { background: #1e293b; }
@keyframes vcSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.vc-modal-head {
  padding: 22px 22px 0;
  display: flex; align-items: center; justify-content: space-between;
}
.vc-modal-head h3 {
  font-family: 'Sora', sans-serif;
  font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;
}
.dark .vc-modal-head h3 { color: #f1f5f9; }
.vc-modal-close {
  width: 30px; height: 30px; border-radius: 8px; border: none;
  background: #f1f5f9; cursor: pointer; color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.vc-modal-close:hover { background: #e2e8f0; }

/* Form */
.vc-form { padding: 18px 22px 22px; }
.vc-field { margin-bottom: 14px; }
.vc-field label {
  display: block; font-size: 11px; font-weight: 700;
  color: #475569; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.05em;
}
.vc-field input {
  width: 100%; padding: 9px 13px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; font-size: 14px;
  background: #f8fafc; color: #0f172a; transition: border-color 0.15s; box-sizing: border-box;
}
.dark .vc-field input { background: #0f172a; border-color: #334155; color: #f1f5f9; }
.vc-field input:focus { outline: none; border-color: #2563eb; background: #fff; }
.vc-pwd-wrap { position: relative; }
.vc-pwd-wrap input { padding-right: 42px; }
.vc-eye-btn {
  position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
  border: none; background: none; cursor: pointer; color: #94a3b8; padding: 4px;
}
.vc-strength-bar {
  height: 4px; border-radius: 4px; margin-top: 7px; background: #e2e8f0; overflow: hidden;
}
.vc-strength-fill { height: 100%; border-radius: 4px; transition: width 0.3s, background-color 0.3s; }
.vc-strength-label { font-size: 11px; margin-top: 3px; font-weight: 600; }
.vc-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }

.vc-modal-footer {
  display: flex; gap: 10px; justify-content: flex-end; padding: 0 22px 22px;
}
.vc-btn-cancel {
  padding: 9px 18px; border-radius: 10px; border: 1.5px solid #e2e8f0;
  background: none; color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;
}
.vc-btn-cancel:hover { background: #f1f5f9; }
.vc-btn-submit {
  padding: 9px 22px; border-radius: 10px; border: none;
  background: #2563eb; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer;
}
.vc-btn-submit:hover:not(:disabled) { background: #1d4ed8; }
.vc-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* Confirm modal */
.vc-confirm-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: #fee2e2; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px; color: #dc2626;
}
.vc-confirm-body { text-align: center; padding: 22px; }
.vc-confirm-body h3 { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.dark .vc-confirm-body h3 { color: #f1f5f9; }
.vc-confirm-body p { font-size: 13px; color: #64748b; margin: 0; }
.vc-btn-danger {
  padding: 9px 22px; border-radius: 10px; border: none;
  background: #dc2626; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer;
}
.vc-btn-danger:hover { background: #b91c1c; }
`;

/* ─────────────────────────────────────────
   Composant principal
───────────────────────────────────────── */
const FILTRE_LABELS = {
  JOUR:    "aujourd'hui",
  SEMAINE: 'cette semaine',
  MOIS:    'ce mois',
  TOUT:    'au total',
};

export default function VendeurCaisses() {
  const [caisses,       setCaisses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filtre,        setFiltre]        = useState('JOUR');
  const [showCreate,    setShowCreate]    = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPwd,       setShowPwd]       = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [form, setForm] = useState({ nomCaisse: '', email: '', password: '' });

  /* ── Chargement ── */
  const load = useCallback(async (periode) => {
    try {
      setLoading(true);
      const data = await vendeurService.getCaisses(periode);
      setCaisses(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement des caisses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filtre); }, [filtre, load]);

  /* ── Filtrage ── */
  const handleFiltre = (key) => {
    if (key === filtre) return;
    setFiltre(key);
  };

  /* ── Grand total période ── */
  const grandTotal = caisses.reduce((sum, c) => sum + (Number(c.totalVentesPeriode) || 0), 0);
  const totalPayes = caisses.reduce((sum, c) => sum + (Number(c.nombreQrPayesPeriode) || 0), 0);

  /* ── Handlers ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isPasswordValid(form.password)) {
      toast.error('Mot de passe trop faible (min 8 car., 1 majuscule, 1 chiffre)');
      return;
    }
    setSubmitting(true);
    try {
      await vendeurService.createCaisse(form);
      toast.success('Caisse créée avec succès !');
      setShowCreate(false);
      setForm({ nomCaisse: '', email: '', password: '' });
      load(filtre);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (c) => {
    try {
      await vendeurService.toggleCaisse(c.id);
      toast.success(c.actif ? 'Caisse suspendue' : 'Caisse activée');
      load(filtre);
    } catch { toast.error('Erreur lors de la mise à jour'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await vendeurService.deleteCaisse(confirmDelete.id);
      toast.success('Caisse supprimée définitivement');
      setConfirmDelete(null);
      load(filtre);
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const strength = getPasswordStrength(form.password);
  const pwdValid = isPasswordValid(form.password);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="vc-root">

        {/* ── Hero ── */}
        <div className="vc-hero">
          <div className="vc-hero-left">
            <h1>Gestion des Caisses</h1>
            <p>{caisses.length} caisse(s) · Recettes {FILTRE_LABELS[filtre]}</p>
          </div>
          <button className="vc-hero-btn" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Nouvelle Caisse
          </button>
        </div>

        {/* ── Filtres ── */}
        <div className="vc-filters">
          {FILTRES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`vc-filter-btn${filtre === key ? ' active' : ''}`}
              onClick={() => handleFiltre(key)}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── Total banner ── */}
        {!loading && caisses.length > 0 && (
          <div className="vc-total-banner">
            <div className="vc-total-left">
              <div className="vc-total-icon">
                <TrendingUp size={22} color="white" />
              </div>
              <div className="vc-total-text">
                <p className="vc-total-label">
                  Total encaissé · {FILTRE_LABELS[filtre]}
                </p>
                <p className="vc-total-amount">{fmt(grandTotal)}</p>
              </div>
            </div>
            <div className="vc-total-right">
              <p className="vc-total-sub">Paiements validés</p>
              <p className="vc-total-caisses">{totalPayes} transaction{totalPayes > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="vc-loading">Chargement…</div>
        ) : caisses.length === 0 ? (
          <div className="vc-empty">
            <Users size={52} />
            <h3>Aucune caisse configurée</h3>
            <p>Créez votre première caisse pour permettre à vos employés d'encaisser sans accéder à votre solde.</p>
          </div>
        ) : (
          <div className="vc-grid">
            {caisses.map((c) => (
              <div key={c.id} className={`vc-card${!c.actif ? ' suspended' : ''}`}>

                {/* Top */}
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

                {/* Stats */}
                <div className="vc-card-stats">
                  {/* Période */}
                  <div className="vc-stat vc-period-stat">
                    <p className="vc-stat-val" style={{ color: '#2563eb', fontSize: 14 }}>
                      {fmt(c.totalVentesPeriode)}
                    </p>
                    <p className="vc-stat-lbl">
                      {filtre === 'TOUT' ? 'Total global' : `Encaissé ${FILTRE_LABELS[filtre]}`}
                    </p>
                  </div>
                  {/* Transactions période */}
                  <div className="vc-stat">
                    <p className="vc-stat-val" style={{ color: '#16a34a' }}>
                      {c.nombreQrPayesPeriode ?? 0}
                    </p>
                    <p className="vc-stat-lbl">Paiements<br/>{filtre === 'TOUT' ? 'validés' : FILTRE_LABELS[filtre]}</p>
                  </div>
                  {/* QR total */}
                  <div className="vc-stat">
                    <p className="vc-stat-val">{c.nombreQrGeneres ?? 0}</p>
                    <p className="vc-stat-lbl">QR<br/>générés</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="vc-card-actions">
                  <button
                    className={`vc-btn ${c.actif ? 'vc-btn-toggle-off' : 'vc-btn-toggle-on'}`}
                    onClick={() => handleToggle(c)}
                  >
                    {c.actif
                      ? <><UserX size={13} /> Suspendre</>
                      : <><UserCheck size={13} /> Activer</>}
                  </button>
                  <button className="vc-btn vc-btn-delete" onClick={() => setConfirmDelete(c)}>
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL CRÉATION ── */}
      {showCreate && (
        <div className="vc-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="vc-modal">
            <div className="vc-modal-head">
              <h3>Nouvelle Caisse</h3>
              <button className="vc-modal-close" onClick={() => setShowCreate(false)}><X size={15}/></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="vc-form">
                <div className="vc-field">
                  <label>Nom de la caisse</label>
                  <input type="text" required placeholder="ex: Caisse principale"
                    value={form.nomCaisse}
                    onChange={e => setForm({ ...form, nomCaisse: e.target.value })} />
                </div>
                <div className="vc-field">
                  <label>Email de connexion</label>
                  <input type="email" required placeholder="ex: caisse1@monmagasin.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="vc-field">
                  <label>Mot de passe</label>
                  <div className="vc-pwd-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'} required
                      placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" className="vc-eye-btn" onClick={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {form.password && (
                    <>
                      <div className="vc-strength-bar">
                        <div className="vc-strength-fill"
                          style={{ width: `${(strength.score/4)*100}%`, backgroundColor: strength.color }} />
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
                <button type="button" className="vc-btn-cancel" onClick={() => setShowCreate(false)}>Annuler</button>
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
        <div className="vc-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="vc-modal">
            <div className="vc-confirm-body">
              <div className="vc-confirm-icon"><AlertTriangle size={26}/></div>
              <h3>Supprimer cette caisse ?</h3>
              <p>
                <strong>{confirmDelete.nomCaisse}</strong> ({confirmDelete.email}) sera supprimée
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
}
