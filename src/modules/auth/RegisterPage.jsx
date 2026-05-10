import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import toast from 'react-hot-toast';
import { QrCode, Check, ArrowRight, ShieldCheck, Clock, Layers, Wallet } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

/* ─── GLOBAL CSS ──────────────────────────────────────────────────────────── */
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  .rp-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
  }
  .dark .rp-container { background-color: #0f172a; }

  @media (min-width: 1024px) {
    .rp-container { flex-direction: row; }
  }

  .rp-sidebar {
    display: none;
    background-color: #0F172A;
    position: relative;
    overflow: hidden;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
    color: #ffffff;
    border-right: 1px solid #1e293b;
  }
  @media (min-width: 1024px) {
    .rp-sidebar { display: flex; width: 45%; }
  }
  @media (min-width: 1280px) {
    .rp-sidebar { width: 40%; padding: 4rem; }
  }

  .rp-sidebar-blur-1 {
    position: absolute; top: 0; right: 0; width: 600px; height: 600px;
    background: rgba(30, 58, 138, 0.4); border-radius: 9999px;
    transform: translate(25%, -25%); filter: blur(80px);
  }
  .rp-sidebar-blur-2 {
    position: absolute; bottom: 0; left: 0; width: 400px; height: 400px;
    background: #050811; border-radius: 9999px;
    transform: translate(-25%, 25%); filter: blur(60px);
  }

  .rp-register-form *, .rp-register-form *::before, .rp-register-form *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-main-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
  }
  .dark .rp-main-side { background-color: #0f172a; }

  .rp-form-scroll-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  @media (min-width: 1024px) {
    .rp-form-scroll-area { padding: 3rem; }
  }
  @media (min-width: 1280px) {
    .rp-form-scroll-area { padding: 4rem 6rem; }
  }

  .rp-register-form {
    font-family: 'Inter', sans-serif;
    width: 100%;
    max-width: 500px;
  }

  .rp-heading {
    font-family: 'Sora', sans-serif;
    font-size: 32px; font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  .dark .rp-heading { color: #ffffff; }

  .rp-subheading {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 32px;
    line-height: 1.5;
  }
  .dark .rp-subheading { color: #94a3b8; }

  /* ── ROLE TOGGLE ── */
  .rp-role-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .rp-role-btn {
    position: relative;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 24px 16px;
    background: #ffffff;
    cursor: pointer;
    transition: all .2s;
    text-align: left;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    display: flex;
    flex-direction: column;
  }
  .dark .rp-role-btn { background: #1e293b; border-color: #334155; }

  .rp-role-btn:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }

  .rp-role-btn.active-client {
    border: 2px solid #3b82f6;
    background: #ffffff;
  }
  .dark .rp-role-btn.active-client { background: #1e293b; }

  .rp-role-btn.active-vendeur {
    border: 2px solid #f97316;
    background: #ffffff;
  }
  .dark .rp-role-btn.active-vendeur { background: #1e293b; }

  .rp-role-check {
    position: absolute;
    top: 12px; right: 12px;
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    opacity: 0;
    transform: scale(.5);
    transition: all .2s;
  }

  .rp-role-btn.active-client .rp-role-check,
  .rp-role-btn.active-vendeur .rp-role-check {
    opacity: 1;
    transform: scale(1);
  }

  .rp-role-btn.active-client .rp-role-check { background: #3b82f6; }
  .rp-role-btn.active-vendeur .rp-role-check { background: #ea580c; }

  .rp-role-icon-box {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }

  .rp-role-title {
    font-family: 'Sora', sans-serif;
    font-size: 17px; font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
  }
  .dark .rp-role-title { color: #ffffff; }

  .rp-role-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
  }
  .dark .rp-role-desc { color: #94a3b8; }

  /* ── FORM ── */
  .rp-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .rp-divider-line {
    flex: 1;
    height: 1px;
    background-color: #f1f5f9;
  }
  .dark .rp-divider-line { background-color: #334155; }

  .rp-divider-label {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .rp-form-grid {
    display: grid;
    gap: 20px;
  }

  .rp-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .rp-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rp-label {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
  }
  .dark .rp-label { color: #cbd5e1; }

  .rp-input-wrap {
    position: relative;
  }

  .rp-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #94a3b8;
    display: flex;
    align-items: center;
  }

  .rp-input {
    width: 100%;
    height: 50px;
    padding: 0 16px 0 42px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    background: #f8fafc;
    transition: all .2s;
    outline: none;
    border: 1px solid #f1f5f9;
  }
  .dark .rp-input { background: #1e293b; color: #ffffff; border-color: #334155; }

  .rp-input::placeholder { color: #94a3b8; }

  .rp-input:focus {
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  .dark .rp-input:focus { background: #0f172a; }

  .rp-input.error { border-color: #ef4444; }

  .rp-vendeur-block {
    background: #fffaf5;
    border: 1px solid #ffedd5;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .dark .rp-vendeur-block { background: rgba(249, 115, 22, 0.03); border-color: rgba(249, 115, 22, 0.1); }

  .rp-vendeur-block-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .rp-vendeur-block-title {
    font-size: 14px;
    font-weight: 700;
    color: #c2410c;
  }

  .rp-submit {
    width: 100%;
    height: 54px;
    border: none;
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: all .3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .rp-submit-client {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  }
  .rp-submit-client:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.3);
  }

  .rp-submit-vendeur {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  }
  .rp-submit-vendeur:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(249, 115, 22, 0.3);
  }

  .rp-signin-row {
    text-align: center;
    margin-top: 32px;
    font-size: 15px;
    color: #64748b;
  }

  .rp-signin-link {
    font-weight: 700;
    color: #3b82f6;
    text-decoration: none;
  }

  @media (max-width: 600px) {
    .rp-form-row { grid-template-columns: 1fr; }
  }
`;

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
const IconUser = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconStore = ({ color = 'currentColor' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-5h16l1 5"/><path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M9 22V12h6v10"/>
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/>
  </svg>
);

const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h4l2 5-2.5 1.5a11 11 0 005 5L16 11l5 2v4a2 2 0 01-2 2C7 21 3 9 3 4a2 2 0 012-2z"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);

const IconQr = () => (
  <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
    <rect x="1" y="1" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
    <rect x="12" y="1" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
    <rect x="1" y="12" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
    <rect x="3" y="3" width="5" height="5" fill="white"/>
    <rect x="14" y="3" width="5" height="5" fill="white"/>
    <rect x="3" y="14" width="5" height="5" fill="white"/>
    <rect x="13" y="13" width="2.5" height="2.5" fill="white"/>
    <rect x="16.5" y="13" width="2.5" height="2.5" fill="white"/>
    <rect x="13" y="16.5" width="2.5" height="2.5" fill="white"/>
  </svg>
);

/* ─── FIELD COMPONENT ───────────────────────────────────────────────────── */
function Field({ label, id, type = 'text', icon, placeholder, value, onChange, error, isVendeur }) {
  return (
    <div className="rp-field">
      <label htmlFor={id} className="rp-label">{label}</label>
      <div className="rp-input-wrap">
        <span className="rp-input-icon">{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`rp-input${error ? ' error' : ''}${isVendeur ? ' rp-input-vendeur' : ''}`}
        />
      </div>
      {error && <span className="rp-error-msg">{error}</span>}
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [role, setRole]       = useState('CLIENT');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [form, setForm]       = useState({
    nom: '', email: '', telephone: '', password: '', confirmPassword: '',
    nomCommerce: '', adresse: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCss;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const update = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.nom)       e.nom       = 'Nom requis';
    if (!form.email)     e.email     = 'Email requis';
    if (!form.telephone) e.telephone = 'Téléphone requis';
    if (!form.password)  e.password  = 'Mot de passe requis';
    else if (form.password.length < 6) e.password = 'Minimum 6 caractères';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (role === 'VENDEUR') {
      if (!form.nomCommerce) e.nomCommerce = 'Nom du commerce requis';
      if (!form.adresse)     e.adresse     = 'Adresse requise';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        nom: form.nom, email: form.email,
        telephone: form.telephone, password: form.password,
      };
      if (role === 'VENDEUR') {
        data.nomCommerce = form.nomCommerce;
        data.adresse     = form.adresse;
        await authService.registerVendeur(data);
      } else {
        await authService.registerClient(data);
      }
      toast.success('Compte créé avec succès ! Connectez-vous.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isVendeur = role === 'VENDEUR';
  const accentColor = isVendeur ? '#ea580c' : '#1d4ed8';

  return (
    <div className="rp-container">
      
      {/* Branding Side (Desktop) */}
      <div className="rp-sidebar">
        <div className="rp-sidebar-blur-1" />
        <div className="rp-sidebar-blur-2" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <QrCode size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic">
              Pay<span className="text-primary-400 not-italic">Qr</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-10 mt-12 mb-auto">
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.2] tracking-tight text-white">
            Rejoignez PayQr,<br />
            la plateforme <span className="text-primary-400">tout-en-un</span><br />
            pour vos paiements
          </h1>
          <p className="text-base text-gray-400 leading-relaxed max-w-md">
            Portefeuille virtuel, QR Codes dynamiques et gestion multi-opérateurs — tout dans une seule application.
          </p>
          
          <div className="space-y-7 pt-12 border-t border-white/5">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <ShieldCheck size={20} className="text-blue-400" />
              </div>
              <p className="text-gray-300 font-medium text-lg">QR Codes à usage unique, sécurisés</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-600/20 flex items-center justify-center border border-orange-500/30">
                <Wallet size={20} className="text-orange-400" />
              </div>
              <p className="text-gray-300 font-medium text-lg">Orange Money & MTN MoMo unifiés</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-600/20 flex items-center justify-center border border-green-500/30">
                <Clock size={20} className="text-green-400" />
              </div>
              <p className="text-gray-300 font-medium text-lg">Historique et suivi en temps réel</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                <Layers size={20} className="text-indigo-400" />
              </div>
              <p className="text-gray-300 font-medium text-lg">Sécurisé par JWT multi-rôles</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 pt-8">
           <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
             <div className="w-6 h-6 bg-[#FF6600] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
             </div>
             <span className="text-sm font-bold text-white/90">Orange Money</span>
           </div>
           <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
             <div className="w-6 h-6 bg-[#FFCC00] rounded-full flex items-center justify-center text-black font-black text-[11px] leading-none">
                M
             </div>
             <span className="text-sm font-bold text-white/90">MTN MoMo</span>
           </div>
        </div>
      </div>

      {/* Main Content Side */}
      <div className="rp-main-side">
        <header className="h-20 px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-xl font-black italic dark:text-white">Pay<span className="text-primary-600 not-italic">Qr</span></span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="rp-form-scroll-area">
          <div className="rp-register-form animate-fade-in">
            <h1 className="rp-heading">Créer un compte</h1>
            <p className="rp-subheading">Choisissez votre profil et rejoignez-nous.</p>

            {/* ── ROLE SELECTOR ── */}
            <div className="rp-role-grid">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`rp-role-btn${role === 'CLIENT' ? ' active-client' : ''}`}
              >
                <div className="rp-role-check"><Check size={12} strokeWidth={4} /></div>
                <div className="rp-role-icon-box" style={{ background: role === 'CLIENT' ? '#dbeafe' : '#f1f5f9' }}>
                  <IconUser color={role === 'CLIENT' ? '#1d4ed8' : '#94a3b8'} />
                </div>
                <div className="rp-role-title">Client</div>
                <div className="rp-role-desc">Scannez, payez et gérez votre portefeuille facilement.</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('VENDEUR')}
                className={`rp-role-btn${role === 'VENDEUR' ? ' active-vendeur' : ''}`}
              >
                <div className="rp-role-check"><Check size={12} strokeWidth={4} /></div>
                <div className="rp-role-icon-box" style={{ background: role === 'VENDEUR' ? '#ffedd5' : '#f1f5f9' }}>
                  <IconStore color={role === 'VENDEUR' ? '#ea580c' : '#94a3b8'} />
                </div>
                <div className="rp-role-title">Vendeur</div>
                <div className="rp-role-desc">Générez des QR Codes, encaissez et retirez.</div>
              </button>
            </div>

            {/* ── DIVIDER ── */}
            <div className="rp-divider">
              <div className="rp-divider-line" />
              <span className="rp-divider-label">Informations personnelles</span>
              <div className="rp-divider-line" />
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="rp-form-grid">
                <Field id="nom" label="Nom complet" icon={<IconUser />} placeholder="Ex : Jean Dupont"
                  value={form.nom} onChange={update('nom')} error={errors.nom} />

                <Field id="email" label="Email" type="email" icon={<IconMail />} placeholder="Ex : jean@email.com"
                  value={form.email} onChange={update('email')} error={errors.email} />

                <Field id="tel" label="Téléphone" icon={<IconPhone />} placeholder="+237 6XX XXX XXX"
                  value={form.telephone} onChange={update('telephone')} error={errors.telephone} />

                {isVendeur && (
                  <div className="rp-vendeur-block">
                    <div className="rp-vendeur-block-header">
                      <IconStore color="#ea580c" />
                      <span className="rp-vendeur-block-title">Informations du commerce</span>
                    </div>
                    <div className="rp-form-row">
                      <Field id="commerce" label="Nom du commerce" icon={<IconStore />} placeholder="Ma Boutique"
                        value={form.nomCommerce} onChange={update('nomCommerce')} error={errors.nomCommerce} isVendeur />
                      <Field id="adresse" label="Adresse" icon={<IconMapPin />} placeholder="Ville, Quartier"
                        value={form.adresse} onChange={update('adresse')} error={errors.adresse} isVendeur />
                    </div>
                  </div>
                )}

                <div className="rp-form-row">
                  <Field id="pwd" label="Mot de passe" type="password" icon={<IconLock />} placeholder="••••••••"
                    value={form.password} onChange={update('password')} error={errors.password} isVendeur={isVendeur} />
                  <Field id="cpwd" label="Confirmer" type="password" icon={<IconLock />} placeholder="••••••••"
                    value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} isVendeur={isVendeur} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`rp-submit ${isVendeur ? 'rp-submit-vendeur' : 'rp-submit-client'}`}
              >
                {loading
                  ? <><div className="rp-spinner" /> Création…</>
                  : <>{`Créer mon compte ${isVendeur ? 'vendeur' : 'client'}`} <ArrowRight size={18} /></>
                }
              </button>
            </form>

            <p className="rp-signin-row">
              Déjà un compte ?{' '}
              <Link to="/login" className="rp-signin-link">Se connecter</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}