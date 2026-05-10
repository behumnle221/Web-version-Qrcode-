import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { QrCode, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Clock, Zap } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  }
  .dark .lp-root { background: #0f172a; }

  @media (min-width: 1024px) {
    .lp-root { flex-direction: row; }
  }

  /* ── LEFT PANEL ── */
  .lp-left {
    display: none;
    background: #0F172A;
    flex-direction: column;
    justify-content: space-between;
    padding: 3.5rem;
    position: relative;
    overflow: hidden;
    color: #ffffff;
    border-right: 1px solid #1e293b;
  }
  @media (min-width: 1024px) {
    .lp-left { display: flex; width: 45%; }
  }
  @media (min-width: 1280px) {
    .lp-left { width: 40%; padding: 4.5rem; }
  }

  .lp-left-blur-1 {
    position: absolute; top: 0; right: 0; width: 600px; height: 600px;
    background: rgba(30, 58, 138, 0.4); border-radius: 9999px;
    transform: translate(25%, -25%); filter: blur(80px);
  }
  .lp-left-blur-2 {
    position: absolute; bottom: 0; left: 0; width: 400px; height: 400px;
    background: #050811; border-radius: 9999px;
    transform: translate(-25%, 25%); filter: blur(60px);
  }

  .lp-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    position: relative;
    z-index: 10;
  }

  .lp-brand-icon {
    width: 48px; height: 48px;
    background: #2563eb;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
  }

  .lp-brand-name {
    font-family: 'Sora', sans-serif;
    font-size: 28px; font-weight: 800; color: #fff;
    letter-spacing: -0.03em;
    font-style: italic;
    text-transform: uppercase;
  }
  .lp-brand-name span { color: #60a5fa; font-style: normal; }

  /* ── CONTENT ── */
  .lp-left-content {
    position: relative;
    z-index: 10;
    margin-top: 2rem;
    margin-bottom: auto;
  }

  .lp-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 9999px;
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(37, 99, 235, 0.2);
    font-size: 11px;
    font-weight: 800;
    color: #60a5fa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2rem;
  }
  .lp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; }

  .lp-title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(32px, 3.5vw, 48px);
    font-weight: 800;
    color: #fff;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
  }
  .lp-title span { color: #3b82f6; }

  .lp-sub {
    font-size: 16px;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 3rem;
    max-width: 400px;
  }

  /* ── STATS ── */
  .lp-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 2.5rem;
  }

  .lp-stat {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.3s;
  }
  .lp-stat:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.15); }

  .lp-stat-val {
    font-family: 'Sora', sans-serif;
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 4px;
  }
  .lp-stat-val span { color: #3b82f6; }

  .lp-stat-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }

  /* ── FEATURES ── */
  .lp-features {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  .lp-feature {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lp-feat-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(37, 99, 235, 0.1);
    border: 1px solid rgba(37, 99, 235, 0.2);
  }

  .lp-feat-text {
    font-size: 15px;
    color: #cbd5e1;
    font-weight: 500;
  }

  /* ── OPERATORS ── */
  .lp-operators {
    position: relative;
    z-index: 10;
    display: flex;
    gap: 1rem;
  }

  .lp-oper-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.2s;
  }
  .lp-oper-badge:hover { background: rgba(255, 255, 255, 0.06); }

  .lp-oper-icon {
    width: 24px; height: 24px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900;
  }

  /* ── RIGHT PANEL ── */
  .lp-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  }
  .dark .lp-right { background: #0f172a; }

  .lp-right-header {
    height: 5rem;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  @media (min-width: 1024px) {
    .lp-right-header { padding: 0 3rem; }
  }

  .lp-right-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .lp-form-box {
    width: 100%;
    max-width: 420px;
    animation: fade-in 0.6s ease-out;
  }

  .lp-heading {
    font-family: 'Sora', sans-serif;
    font-size: 36px; font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    margin-bottom: 0.5rem;
  }
  .dark .lp-heading { color: #ffffff; }

  .lp-subheading {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 2.5rem;
  }
  .dark .lp-subheading { color: #94a3b8; }

  /* ── FORM ── */
  .lp-form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .lp-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .lp-label {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
  }
  .dark .lp-label { color: #cbd5e1; }

  .lp-input-wrap { position: relative; }

  .lp-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #94a3b8;
    display: flex; align-items: center;
  }

  .lp-input {
    width: 100%;
    height: 54px;
    padding: 0 1rem 0 44px;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    background: #f1f5f9;
    transition: all 0.2s;
    outline: none;
    border: 1px solid #e2e8f0;
  }
  .dark .lp-input { background: #1e293b; color: #ffffff; border-color: #334155; }

  .lp-input::placeholder { color: #94a3b8; }

  .lp-input:focus {
    background: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }
  .dark .lp-input:focus { background: #0f172a; }

  .lp-input.error { border-color: #ef4444; }

  /* ── OPTIONS ── */
  .lp-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }

  .lp-remember {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #475569;
    font-weight: 500;
  }
  .dark .lp-remember { color: #94a3b8; }

  .lp-checkbox {
    width: 20px; height: 20px;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .dark .lp-checkbox { background: #1e293b; border-color: #334155; }

  .lp-checkbox.checked {
    background: #2563eb;
    border-color: #2563eb;
  }

  .lp-forgot {
    font-size: 14px;
    font-weight: 700;
    color: #2563eb;
    text-decoration: none;
  }

  /* ── SUBMIT ── */
  .lp-submit {
    width: 100%;
    height: 56px;
    border: none;
    border-radius: 16px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }
  .lp-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(37, 99, 235, 0.12);
    border-color: #2563eb;
    color: #2563eb;
  }

  .lp-submit:disabled { opacity: 0.7; cursor: not-allowed; }

  .lp-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(37, 99, 235, 0.2);
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: lp-spin .8s linear infinite;
  }

  @keyframes lp-spin { to { transform: rotate(360deg); } }

  /* ── DIVIDER ── */
  .lp-divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2.5rem 0;
  }
  .lp-div-line { flex: 1; height: 1px; background: #f1f5f9; }
  .dark .lp-div-line { background: #334155; }
  .lp-div-label { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

  /* ── FOOTER ── */
  .lp-cta-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 56px;
    border: 2px solid #f1f5f9;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    text-decoration: none;
    transition: all 0.2s;
  }
  .dark .lp-cta-btn { border-color: #334155; color: #ffffff; }
  .lp-cta-btn:hover { border-color: #2563eb; color: #2563eb; }

  .lp-trust {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 2rem;
    font-size: 13px;
    color: #94a3b8;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCss;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const validate = () => {
    const e = {};
    if (!email)    e.email    = 'Email requis';
    if (!password) e.password = 'Mot de passe requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Connexion réussie !');
      
      // Role-based redirection
      if (user.role === 'VENDEUR') {
        navigate('/vendeurs');
      } else if (user.role === 'CLIENT') {
        navigate('/clients');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Identifiants incorrects';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="lp-root">

      {/* ── LEFT PANEL ── */}
      <aside className="lp-left">
        <div className="lp-left-blur-1" />
        <div className="lp-left-blur-2" />

        <Link to="/" className="lp-brand">
          <div className="lp-brand-icon">
            <QrCode size={24} className="text-white" />
          </div>
          <span className="lp-brand-name">Pay<span>Qr</span></span>
        </Link>

        <div className="lp-left-content">
          <div className="lp-badge">
            <div className="lp-badge-dot" />
            Bienvenue sur PayQr
          </div>

          <h1 className="lp-title">
            Vos paiements,<br />
            <span>simples</span> et<br />
            sécurisés
          </h1>

          <p className="lp-sub">
            Connectez-vous pour accéder à votre portefeuille virtuel, vos QR Codes et votre historique de transactions.
          </p>

          <div className="lp-stats">
            {[
              { val: '< 3', unit: 's', label: 'Temps de réponse' },
              { val: '99',  unit: '%', label: 'Disponibilité'    },
              { val: '2',   unit: '',  label: 'Opérateurs'       },
            ].map((s, i) => (
              <div key={i} className="lp-stat">
                <div className="lp-stat-val">
                  <span>{s.val}</span>{s.unit}
                </div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="lp-features">
            <div className="lp-feature">
              <div className="lp-feat-icon">
                <ShieldCheck size={18} className="text-blue-400" />
              </div>
              <span className="lp-feat-text">QR Codes à usage unique, sécurisés</span>
            </div>
            <div className="lp-feature">
              <div className="lp-feat-icon">
                <Zap size={18} className="text-orange-400" />
              </div>
              <span className="lp-feat-text">Orange Money & MTN MoMo unifiés</span>
            </div>
            <div className="lp-feature">
              <div className="lp-feat-icon">
                <Clock size={18} className="text-green-400" />
              </div>
              <span className="lp-feat-text">Historique et suivi en temps réel</span>
            </div>
          </div>
        </div>

        <div className="lp-operators">
          <div className="lp-oper-badge">
            <div className="lp-oper-icon" style={{ background: '#FF6600', color: '#fff' }}>O</div>
            <span className="text-sm font-bold text-white/90">Orange Money</span>
          </div>
          <div className="lp-oper-badge">
            <div className="lp-oper-icon" style={{ background: '#FFCC00', color: '#000' }}>M</div>
            <span className="text-sm font-bold text-white/90">MTN MoMo</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="lp-right">
        <header className="lp-right-header">
          <ThemeToggle />
        </header>

        <div className="lp-right-content">
          <div className="lp-form-box">
            <h1 className="lp-heading">Connexion</h1>
            <p className="lp-subheading">Connectez-vous à votre compte PayQr.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="lp-form-grid">
                
                <div className="lp-field">
                  <label htmlFor="email" className="lp-label">Adresse email</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Mail size={18} /></span>
                    <input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`lp-input${errors.email ? ' error' : ''}`}
                    />
                  </div>
                  {errors.email && <span className="lp-error-msg">{errors.email}</span>}
                </div>

                <div className="lp-field">
                  <label htmlFor="password" className="lp-label">Mot de passe</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><Lock size={18} /></span>
                    <input
                      id="password"
                      type="password"
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`lp-input${errors.password ? ' error' : ''}`}
                    />
                  </div>
                  {errors.password && <span className="lp-error-msg">{errors.password}</span>}
                </div>
              </div>

              <div className="lp-options">
                <label className="lp-remember" onClick={() => setRemember(!remember)}>
                  <div className={`lp-checkbox${remember ? ' checked' : ''}`}>
                    {remember && <IconCheck />}
                  </div>
                  Se souvenir de moi
                </label>
                <Link to="/forgot-password" className="lp-forgot">Mot de passe oublié ?</Link>
              </div>

              <button type="submit" disabled={loading} className="lp-submit">
                {loading
                  ? <div className="lp-spinner" />
                  : <>Se connecter <ArrowRight size={18} /></>
                }
              </button>
            </form>

            <div className="lp-divider">
              <div className="lp-div-line" />
              <span className="lp-div-label">Pas encore de compte ?</span>
              <div className="lp-div-line" />
            </div>

            <Link to="/register" className="lp-cta-btn">
              Créer un compte gratuit
              <ArrowRight size={18} />
            </Link>

            <div className="lp-trust">
              <ShieldCheck size={16} />
              <span>Connexion sécurisée par JWT · Aangaraa-Pay</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
