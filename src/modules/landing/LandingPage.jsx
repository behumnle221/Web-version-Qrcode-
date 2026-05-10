import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const navLinks = [
  { label: 'Comment ça marche', href: '#flux'      },
  { label: 'Avantages',         href: '#avantages' },
  { label: 'Rôles',             href: '#roles'     },
  { label: 'Contact',           href: '#contact'   },
];

const stats = [
  { value: '< 3s', label: 'Temps de réponse moyen' },
  { value: '99 %', label: 'Taux de disponibilité'  },
  { value: '3',    label: 'Rôles distincts gérés'  },
  { value: '2',    label: 'Opérateurs unifiés'      },
];

const flux = [
  {
    num: '01', color: '#1d4ed8', bgColor: '#eff6ff',
    title: 'Le vendeur génère un QR Code',
    desc:  "En quelques secondes, le vendeur crée un QR Code dynamique avec le montant exact. Chaque code est unique, horodaté et invalide après usage.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="1" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
        <rect x="12" y="1" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
        <rect x="1" y="12" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
        <rect x="3" y="3" width="5" height="5" fill="#1d4ed8"/>
        <rect x="14" y="3" width="5" height="5" fill="#1d4ed8"/>
        <rect x="3" y="14" width="5" height="5" fill="#1d4ed8"/>
        <rect x="13" y="13" width="2.5" height="2.5" fill="#1d4ed8"/>
        <rect x="16.5" y="13" width="2.5" height="2.5" fill="#1d4ed8"/>
        <rect x="13" y="16.5" width="2.5" height="2.5" fill="#1d4ed8"/>
      </svg>
    ),
  },
  {
    num: '02', color: '#ea580c', bgColor: '#fff7ed',
    title: 'Le client scanne et choisit son moyen de paiement',
    desc:  "Via l'application mobile, le client scanne le QR Code et règle depuis son portefeuille virtuel PayQr ou directement via Orange Money / MTN MoMo.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="3" stroke="#ea580c" strokeWidth="1.8"/>
        <circle cx="12" cy="17" r="1.2" fill="#ea580c"/>
        <line x1="8" y1="6" x2="16" y2="6" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="9.5" x2="16" y2="9.5" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '03', color: '#d97706', bgColor: '#fefce8',
    title: 'Les soldes se mettent à jour en temps réel',
    desc:  "Dès la confirmation d'Aangaraa-Pay via webhook, le solde virtuel du vendeur est crédité et la transaction est tracée dans l'historique des deux parties.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polyline points="4,15 9,9 13,13 20,5" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="15,5 20,5 20,10" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: '04', color: '#1d4ed8', bgColor: '#eff6ff',
    title: 'Le vendeur retire ses fonds vers Mobile Money',
    desc:  "En un tap, le vendeur transfère son solde PayQr vers son Orange Money ou son MTN MoMo, avec vérification automatique du solde et délai de sécurité.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="14" rx="3" stroke="#1d4ed8" strokeWidth="1.8"/>
        <line x1="2" y1="10" x2="22" y2="10" stroke="#1d4ed8" strokeWidth="1.8"/>
        <rect x="5" y="13.5" width="5" height="3" rx="1" fill="#1d4ed8"/>
      </svg>
    ),
  },
];

const avantages = [
  {
    color: '#1d4ed8', bgColor: '#eff6ff', badge: 'Sécurité',
    title: 'QR Code dynamique à montant pré-rempli',
    desc:  "Chaque QR Code PayQr est généré pour une transaction précise. Le client ne saisit aucun montant : zéro erreur, zéro fraude.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="1" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
        <rect x="12" y="1" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
        <rect x="1" y="12" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
        <rect x="3" y="3" width="5" height="5" fill="#1d4ed8"/>
        <rect x="14" y="3" width="5" height="5" fill="#1d4ed8"/>
        <rect x="3" y="14" width="5" height="5" fill="#1d4ed8"/>
      </svg>
    ),
  },
  {
    color: '#ea580c', bgColor: '#fff7ed', badge: 'Unification',
    title: 'Portefeuille multi-opérateurs unifié',
    desc:  "Orange Money ET MTN MoMo dans une seule interface. Le vendeur accepte les deux opérateurs sans changer d'application.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11C4 7.134 7.134 4 11 4s7 3.134 7 7-3.134 7-7 7" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M11 8v3l2 2" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M2 14l2 1 1-2" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    color: '#d97706', bgColor: '#fefce8', badge: 'Gestion',
    title: 'Tableau de bord vendeur complet',
    desc:  "Historique des ventes, solde en temps réel, suivi de chaque transaction par statut. Aucune solution locale n'offre cette visibilité.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polyline points="3,14 8,8 12,12 19,4" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14,4 19,4 19,9" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    color: '#1d4ed8', bgColor: '#eff6ff', badge: 'Authentification',
    title: 'Sécurité JWT multi-rôles',
    desc:  "Chaque utilisateur est authentifié par un token JWT signé contenant son rôle. Aucun endpoint n'est accessible sans autorisation explicite.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L14 8h6l-5 4 2 6-6-4-6 4 2-6L2 8h6z" stroke="#1d4ed8" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    color: '#ea580c', bgColor: '#fff7ed', badge: 'Fiabilité',
    title: 'Synchronisation asynchrone des paiements',
    desc:  "Un mécanisme de Sync rattrape automatiquement les transactions restées en PENDING suite à un délai réseau.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="13,2 3,13 11,13 9,21 19,9 11,9" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    color: '#d97706', bgColor: '#fefce8', badge: 'Mobile',
    title: 'Application mobile Flutter multiplateforme',
    desc:  "Une seule base de code Dart pour Android et iOS. Le client scanne, consulte son solde et effectue ses paiements depuis son téléphone.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="2" width="14" height="18" rx="3" stroke="#d97706" strokeWidth="1.6"/>
        <circle cx="11" cy="16" r="1.2" fill="#d97706"/>
        <line x1="7" y1="7" x2="15" y2="7" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="7" y1="10.5" x2="15" y2="10.5" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const roles = [
  {
    initial: 'C', title: 'Client',
    color: '#1d4ed8', headBg: '#f0f9ff', headBorder: '#e0f2fe',
    iconBg: '#dbeafe', btnBg: '#1d4ed8', btnShadow: 'rgba(29,78,216,.24)',
    showBtn: true,
    actions: [
      "Recharger son portefeuille virtuel (Orange ou MTN)",
      "Scanner le QR Code du vendeur",
      "Payer via solde interne ou Mobile Money",
      "Consulter l'historique détaillé de ses paiements",
      "Retirer son solde vers Mobile Money",
    ],
  },
  {
    initial: 'V', title: 'Vendeur',
    color: '#ea580c', headBg: '#fff7ed', headBorder: '#fed7aa',
    iconBg: '#ffedd5', btnBg: '#ea580c', btnShadow: 'rgba(234,88,12,.24)',
    showBtn: true,
    actions: [
      "Générer un QR Code avec montant exact",
      "Recevoir les paiements en temps réel",
      "Suivre ses ventes et encaissements",
      "Gérer son solde virtuel accumulé",
      "Retirer ses fonds vers Orange ou MTN",
    ],
  },
  {
    initial: 'A', title: 'Administrateur',
    color: '#475569', headBg: '#f8fafc', headBorder: '#e2e8f0',
    iconBg: '#e2e8f0', btnBg: null, btnShadow: null,
    showBtn: false,
    actions: [
      "Superviser toutes les transactions",
      "Gérer les comptes clients et vendeurs",
      "Configurer les frais de la plateforme",
      "Accéder aux statistiques globales",
      "Résoudre les litiges et anomalies",
    ],
  },
];

const faqs = [
  {
    q: "Pourquoi PayQr et pas Orange Money directement ?",
    a: "Orange Money et MTN MoMo fonctionnent en silos. PayQr unifie les deux opérateurs dans un seul portefeuille virtuel, avec un tableau de bord vendeur complet et des QR Codes dynamiques à montant pré-rempli que ces opérateurs ne proposent pas.",
  },
  {
    q: "Comment le paiement est-il sécurisé ?",
    a: "Chaque QR Code est unique et expire après utilisation. Les soldes sont protégés par des mécanismes de verrouillage contre le double traitement. L'authentification utilise le standard JWT avec gestion stricte des rôles.",
  },
  {
    q: "Quels opérateurs sont supportés ?",
    a: "PayQr supporte Orange Money et MTN MoMo via l'agrégateur Aangaraa-Pay. Le client peut recharger son portefeuille depuis l'un ou l'autre opérateur, et le vendeur peut retirer vers l'un ou l'autre.",
  },
  {
    q: "Faut-il un compte bancaire pour utiliser PayQr ?",
    a: "Non. PayQr fonctionne entièrement avec le Mobile Money (Orange Money et MTN MoMo). Aucun compte bancaire n'est requis, ce qui le rend accessible à tous les commerçants camerounais.",
  },
];

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
  html { scroll-behavior: smooth; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pq-nav-link {
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 500; color: #475569;
    text-decoration: none; transition: color .2s;
  }
  .pq-nav-link:hover { color: #1d4ed8; }

  .btn-ghost {
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    color: #475569; background: none; border: none; cursor: pointer;
    padding: 8px 16px; border-radius: 8px; transition: all .2s; text-decoration: none;
  }
  .btn-ghost:hover { color: #0f172a; background: #f1f5f9; }

  .btn-primary {
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
    color: #fff; background: #1d4ed8; border: none; cursor: pointer;
    padding: 10px 22px; border-radius: 9px; transition: all .2s;
    text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: #1e40af; transform: translateY(-1px); }

  .btn-lg {
    font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
    padding: 14px 28px; border-radius: 10px; display: inline-flex;
    align-items: center; gap: 8px; transition: all .2s; cursor: pointer; border: none;
  }
  .btn-lg-primary {
    background: #1d4ed8; color: #fff;
    box-shadow: 0 4px 16px rgba(29,78,216,.24);
  }
  .btn-lg-primary:hover { background: #1e40af; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(29,78,216,.32); }
  .btn-lg-outline {
    background: #fff; color: #0f172a;
    border: 1.5px solid #e2e8f0 !important;
  }
  .btn-lg-outline:hover { border-color: #94a3b8 !important; background: #f8fafc; }

  .pq-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 30px; transition: all .25s;
  }
  .pq-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(15,23,42,.06);
    border-color: #bfdbfe;
  }

  .pq-role-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 18px;
    overflow: hidden; transition: all .25s;
  }
  .pq-role-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(15,23,42,.08);
  }

  .pq-faq-item {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 13px;
    margin-bottom: 10px; overflow: hidden;
  }
  .pq-faq-item.open { border-color: #bfdbfe; box-shadow: 0 4px 18px rgba(29,78,216,.07); }
  .pq-faq-btn {
    width: 100%; padding: 20px 24px; display: flex; justify-content: space-between;
    align-items: center; background: none; border: none; cursor: pointer;
    text-align: left; gap: 16px; font-family: 'Sora', sans-serif;
  }
  .pq-faq-arrow {
    width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    font-size: 14px; color: #64748b; transition: transform .2s, background .2s;
    font-family: 'Sora', sans-serif; font-weight: 600;
  }
  .pq-faq-item.open .pq-faq-arrow { transform: rotate(180deg); background: #eff6ff; color: #1d4ed8; }
  .pq-faq-answer { display: none; padding: 0 24px 20px; }
  .pq-faq-item.open .pq-faq-answer { display: block; }

  .pq-footer-link { display: block; font-size: 14px; color: #64748b; margin-bottom: 10px; text-decoration: none; transition: color .2s; line-height: 1.5; }
  .pq-footer-link:hover { color: #e2e8f0; }

  .pq-social {
    width: 32px; height: 32px; border-radius: 8px; background: #1e293b;
    display: flex; align-items: center; justify-content: center; color: #64748b;
    font-size: 12px; font-weight: 700; text-decoration: none; transition: all .2s;
    font-family: 'Sora', sans-serif;
  }
  .pq-social:hover { background: #1d4ed8; color: #fff; }

  @keyframes pqFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }

  @media (max-width: 900px) {
    .pq-hero-grid    { grid-template-columns: 1fr !important; }
    .pq-flux-grid    { grid-template-columns: 1fr !important; }
    .pq-adv-grid     { grid-template-columns: 1fr 1fr !important; }
    .pq-roles-grid   { grid-template-columns: 1fr !important; }
    .pq-footer-grid  { grid-template-columns: 1fr 1fr !important; }
    .pq-wrap         { padding: 0 32px !important; }
    .pq-hero         { padding: 72px 32px 72px !important; }
    .pq-section      { padding: 72px 32px !important; }
    .pq-stats        { padding: 44px 32px !important; }
    .pq-cta-section  { padding: 0 32px 72px !important; }
    .pq-footer       { padding: 60px 32px 32px !important; }
  }
  @media (max-width: 640px) {
    .pq-stats-inner  { grid-template-columns: 1fr 1fr !important; }
    .pq-adv-grid     { grid-template-columns: 1fr !important; }
    .pq-wrap         { padding: 0 20px !important; }
    .pq-hero         { padding: 72px 20px 60px !important; gap: 48px !important; }
    .pq-section      { padding: 64px 20px !important; }
    .pq-stats        { padding: 40px 20px !important; }
    .pq-cta-section  { padding: 0 20px 64px !important; }
    .pq-footer       { padding: 52px 20px 28px !important; }
    .pq-footer-grid  { grid-template-columns: 1fr !important; }
    .pq-nav-desktop  { display: none !important; }
    .pq-nav-mob      { display: flex !important; }
    .pq-mob-menu     { display: block !important; }
  }
  @media (min-width: 641px) {
    .pq-nav-mob  { display: none !important; }
    .pq-mob-menu { display: none !important; }
  }
`;

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen,  setFaqOpen]  = useState(0);

  const S = {
    fontFamily: "'Inter', sans-serif",
  };

  const Heading = {
    fontFamily: "'Sora', sans-serif",
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCss;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ ...S, background: '#ffffff', color: '#0f172a', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #e8ecf4',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 56px',
          height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: '#1d4ed8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="1" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
                <rect x="12" y="1" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
                <rect x="1" y="12" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
                <rect x="3" y="3" width="5" height="5" fill="white"/>
                <rect x="14" y="3" width="5" height="5" fill="white"/>
                <rect x="3" y="14" width="5" height="5" fill="white"/>
              </svg>
            </div>
            <span style={{ ...Heading, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              Pay<span style={{ color: '#1d4ed8' }}>Qr</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="pq-nav-desktop" style={{ display: 'flex', gap: 36 }}>
            {navLinks.map(n => (
              <a key={n.label} href={n.href} className="pq-nav-link">{n.label}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="btn-ghost pq-nav-desktop">Se connecter</Link>
            <Link to="/register" className="btn-primary">Créer un compte →</Link>
            {/* Mobile hamburger */}
            <button
              className="pq-nav-mob"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }}
            >
              {menuOpen
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="pq-mob-menu" style={{ background: '#fff', borderTop: '1px solid #f1f5f9', padding: '16px 20px 20px' }}>
            {navLinks.map(n => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ ...S, display: 'block', padding: '11px 0', color: '#374151', fontWeight: 600, fontSize: 15, textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
                {n.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Link to="/login" style={{ ...S, flex: 1, textAlign: 'center', padding: '11px 0', border: '1.5px solid #e2e8f0', borderRadius: 9, color: '#374151', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Connexion
              </Link>
              <Link to="/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px 0', fontSize: 14 }}>
                S'inscrire
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: '#fff' }}>
        <div className="pq-hero" style={{
          maxWidth: 1100, margin: '0 auto', padding: '100px 56px 90px',
          display: 'grid', gridTemplateColumns: '1fr 420px', gap: 80, alignItems: 'center',
        }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#1d4ed8',
              letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 28,
              fontFamily: "'Inter', sans-serif",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1d4ed8' }} />
              Solution fintech · Cameroun
            </div>

            <h1 style={{ ...Heading, fontSize: 'clamp(32px, 3.8vw, 50px)', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', marginBottom: 24, letterSpacing: '-.02em' }}>
              Paiements par QR Code,{' '}
              <span style={{ color: '#1d4ed8' }}>multi-opérateurs</span>{' '}
              pour les commerçants
            </h1>

            <p style={{ ...S, fontSize: 17, color: '#475569', lineHeight: 1.8, marginBottom: 40, maxWidth: 500 }}>
              PayQr unifie{' '}
              <strong style={{ color: '#ea580c', fontWeight: 600 }}>Orange Money</strong> et{' '}
              <strong style={{ color: '#d97706', fontWeight: 600 }}>MTN MoMo</strong>{' '}
              dans un seul portefeuille virtuel. Générez des QR Codes dynamiques, encaissez
              instantanément et gérez vos fonds depuis une interface unique.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link to="/register" className="btn-lg btn-lg-primary">
                Créer un compte gratuit
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="#flux" className="btn-lg btn-lg-outline">Comment ça marche</a>
            </div>

            {/* Compat badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ ...S, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Compatible avec :</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, border: '1px solid #fed7aa', background: '#fff7ed' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>O</div>
                <span style={{ ...S, color: '#c2410c', fontSize: 13, fontWeight: 600 }}>Orange Money</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, border: '1px solid #fde68a', background: '#fefce8' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 10, fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>M</div>
                <span style={{ ...S, color: '#92400e', fontSize: 13, fontWeight: 600 }}>MTN MoMo</span>
              </div>
            </div>
          </div>

          {/* Right — Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', maxWidth: 380, width: '100%', animation: 'pqFloat 4s ease-in-out infinite' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 28, boxShadow: '0 20px 60px rgba(15,23,42,.08)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <div style={{ ...S, fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>Montant à payer</div>
                    <div style={{ ...Heading, fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
                      15 000 <span style={{ fontSize: 14, color: '#1d4ed8', fontWeight: 600 }}>FCFA</span>
                    </div>
                    <div style={{ ...S, fontSize: 12, color: '#94a3b8', marginTop: 3 }}>Boutique Chez Mama · Yaoundé</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="1" y="1" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
                      <rect x="12" y="1" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
                      <rect x="1" y="12" width="9" height="9" rx="2" stroke="#1d4ed8" strokeWidth="1.6"/>
                      <rect x="3" y="3" width="5" height="5" fill="#1d4ed8"/>
                      <rect x="14" y="3" width="5" height="5" fill="#1d4ed8"/>
                      <rect x="3" y="14" width="5" height="5" fill="#1d4ed8"/>
                    </svg>
                  </div>
                </div>
                {/* QR visual */}
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: 20, marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
                  <svg width="130" height="130" viewBox="0 0 140 140">
                    <rect x="8"  y="8"  width="38" height="38" rx="4" fill="#0f172a"/>
                    <rect x="14" y="14" width="26" height="26" rx="2" fill="#fff"/>
                    <rect x="18" y="18" width="18" height="18" rx="1" fill="#0f172a"/>
                    <rect x="94" y="8"  width="38" height="38" rx="4" fill="#0f172a"/>
                    <rect x="100" y="14" width="26" height="26" rx="2" fill="#fff"/>
                    <rect x="104" y="18" width="18" height="18" rx="1" fill="#0f172a"/>
                    <rect x="8"  y="94" width="38" height="38" rx="4" fill="#0f172a"/>
                    <rect x="14" y="100" width="26" height="26" rx="2" fill="#fff"/>
                    <rect x="18" y="104" width="18" height="18" rx="1" fill="#0f172a"/>
                    {[
                      [56,8],[68,8],[80,8],[56,20],[74,20],[62,26],[80,26],
                      [8,56],[26,56],[38,56],[8,68],[20,68],[8,80],[32,80],
                      [56,56],[74,56],[92,56],[110,56],[56,68],[80,68],[56,80],[68,80],[98,80],
                      [56,92],[74,92],[86,92],[56,104],[68,104],[110,104],
                      [56,116],[80,116],[98,116],[56,128],[74,128],[104,128],
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#0f172a"/>
                    ))}
                    <line x1="8" y1="70" x2="132" y2="70" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.4"/>
                  </svg>
                </div>
                {/* Success */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 11 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>✓</div>
                  <div>
                    <div style={{ ...Heading, fontSize: 13, fontWeight: 700, color: '#15803d' }}>QR Code sécurisé</div>
                    <div style={{ ...S, fontSize: 11, color: '#4b5563', marginTop: 1 }}>Usage unique · Expire après paiement</div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div style={{ position: 'absolute', top: -14, right: -14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 11, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.07)', animation: 'pqFloat 3.5s ease-in-out infinite .4s' }}>
                <div style={{ ...S, fontSize: 11, color: '#64748b' }}>Transaction</div>
                <div style={{ ...Heading, fontSize: 13, fontWeight: 700, color: '#16a34a', marginTop: 1 }}>✓ Succès</div>
              </div>
              <div style={{ position: 'absolute', bottom: -14, left: -14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 11, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.07)', animation: 'pqFloat 4s ease-in-out infinite .9s' }}>
                <div style={{ ...S, fontSize: 11, color: '#64748b' }}>Solde vendeur</div>
                <div style={{ ...Heading, fontSize: 13, fontWeight: 700, color: '#ea580c', marginTop: 1 }}>+ 15 000 FCFA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#0f172a', padding: '52px 56px' }} className="pq-stats">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }} className="pq-stats-inner">
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '12px 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
              <div style={{ ...Heading, fontSize: 38, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-.02em' }}>
                {s.value.includes('<') ? <>{'< '}<span style={{ color: '#60a5fa' }}>3</span>s</> : s.value.replace('%', '').trim() === '99' ? <><span style={{ color: '#60a5fa' }}>99</span> %</> : <span style={{ color: '#60a5fa' }}>{s.value}</span>}
              </div>
              <div style={{ ...S, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FLUX ── */}
      <section id="flux" style={{ background: '#fff' }}>
        <div className="pq-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 56px' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: '#eff6ff', color: '#1d4ed8', marginBottom: 16, border: '1px solid #bfdbfe', fontFamily: "'Inter', sans-serif" }}>
              Flux de paiement
            </div>
            <h2 style={{ ...Heading, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, color: '#0f172a', marginBottom: 16, letterSpacing: '-.02em', lineHeight: 1.15 }}>
              Comment PayQr fonctionne
            </h2>
            <p style={{ ...S, fontSize: 16, color: '#64748b', lineHeight: 1.8 }}>
              Un parcours complet en 4 étapes, du QR Code généré par le vendeur au retrait des fonds sur Mobile Money.
            </p>
          </div>
          <div className="pq-flux-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
            {flux.map((f, i) => (
              <div key={i} className="pq-card" style={{ borderLeft: `4px solid ${f.color}`, borderRadius: 16 }}>
                <span style={{ ...S, fontSize: 11, fontWeight: 800, color: f.color, letterSpacing: '.07em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                  Étape {f.num}
                </span>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ ...Heading, fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 10, lineHeight: 1.35 }}>{f.title}</h3>
                <p style={{ ...S, fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section id="avantages" style={{ background: '#f8fafc' }}>
        <div className="pq-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 56px' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: '#eff6ff', color: '#1d4ed8', marginBottom: 16, border: '1px solid #bfdbfe', fontFamily: "'Inter', sans-serif" }}>
              Pourquoi PayQr ?
            </div>
            <h2 style={{ ...Heading, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, color: '#0f172a', marginBottom: 16, letterSpacing: '-.02em', lineHeight: 1.15 }}>
              Ce qu'aucune solution locale ne propose
            </h2>
            <p style={{ ...S, fontSize: 16, color: '#64748b', lineHeight: 1.8 }}>
              Orange Money et MTN fonctionnent en silos. PayQr brise cette fragmentation avec une architecture multi-opérateurs unifiée.
            </p>
          </div>
          <div className="pq-adv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {avantages.map((a, i) => (
              <div key={i} className="pq-card">
                <div style={{ width: 48, height: 48, borderRadius: 13, background: a.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  {a.icon}
                </div>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', background: a.bgColor, color: a.color, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
                  {a.badge}
                </span>
                <h3 style={{ ...Heading, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 10, lineHeight: 1.4 }}>{a.title}</h3>
                <p style={{ ...S, fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ background: '#fff' }}>
        <div className="pq-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 56px' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: '#eff6ff', color: '#1d4ed8', marginBottom: 16, border: '1px solid #bfdbfe', fontFamily: "'Inter', sans-serif" }}>
              Qui peut utiliser PayQr ?
            </div>
            <h2 style={{ ...Heading, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em' }}>
              Trois rôles, une plateforme unifiée
            </h2>
          </div>
          <div className="pq-roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {roles.map((r, i) => (
              <div key={i} className="pq-role-card">
                <div style={{ padding: '26px 26px 20px', background: r.headBg, borderBottom: `1px solid ${r.headBorder}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: r.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 900, color: r.color }}>
                    {r.initial}
                  </div>
                  <h3 style={{ ...Heading, fontSize: 20, fontWeight: 800, color: r.color }}>{r.title}</h3>
                </div>
                <div style={{ padding: '24px 26px' }}>
                  {r.actions.map((action, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: j < r.actions.length - 1 ? 12 : 0 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontSize: 9, color: '#fff', fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>✓</div>
                      <span style={{ ...S, fontSize: 14, color: '#374151', lineHeight: 1.55 }}>{action}</span>
                    </div>
                  ))}
                  {r.showBtn && (
                    <Link to="/register" className="btn-lg btn-lg-primary"
                      style={{ display: 'flex', justifyContent: 'center', marginTop: 22, background: r.btnBg, boxShadow: `0 4px 12px ${r.btnShadow}`, fontSize: 14, textDecoration: 'none', color: '#fff' }}>
                      Compte {r.title.toLowerCase()} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#f8fafc' }}>
        <div className="pq-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 56px' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px' }}>
            <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', background: '#eff6ff', color: '#1d4ed8', marginBottom: 16, border: '1px solid #bfdbfe', fontFamily: "'Inter', sans-serif" }}>
              FAQ
            </div>
            <h2 style={{ ...Heading, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em' }}>
              Questions fréquentes
            </h2>
          </div>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {faqs.map((faq, i) => (
              <div key={i} className={`pq-faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="pq-faq-btn" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{faq.q}</span>
                  <div className="pq-faq-arrow">▾</div>
                </button>
                <div className="pq-faq-answer">
                  <p style={{ ...S, fontSize: 14, color: '#475569', lineHeight: 1.8, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="pq-cta-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 56px 100px' }}>
          <div style={{ background: '#1d4ed8', borderRadius: 24, padding: '72px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -70, right: -70, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ ...Heading, fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-.02em' }}>
                Prêt à moderniser vos encaissements ?
              </h2>
              <p style={{ ...S, fontSize: 17, color: 'rgba(255,255,255,.8)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.75 }}>
                Commerçant à Yaoundé, Douala ou ailleurs — PayQr unifie vos paiements Orange et MTN dans un seul tableau de bord.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" style={{ ...S, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: '#fff', color: '#1d4ed8', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.14)', transition: 'all .2s' }}>
                  Créer mon compte gratuitement →
                </Link>
                <Link to="/login" style={{ ...S, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,.3)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none', background: 'rgba(255,255,255,.12)', transition: 'all .2s' }}>
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="pq-footer" style={{ background: '#0f172a', padding: '72px 56px 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="pq-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 48, marginBottom: 56 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, background: '#1d4ed8', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                    <rect x="1" y="1" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
                    <rect x="12" y="1" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
                    <rect x="1" y="12" width="9" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
                    <rect x="3" y="3" width="5" height="5" fill="white"/>
                    <rect x="14" y="3" width="5" height="5" fill="white"/>
                    <rect x="3" y="14" width="5" height="5" fill="white"/>
                  </svg>
                </div>
                <span style={{ ...Heading, fontSize: 20, fontWeight: 800, color: '#fff' }}>
                  Pay<span style={{ color: '#60a5fa' }}>Qr</span>
                </span>
              </div>
              <p style={{ ...S, fontSize: 14, color: '#64748b', lineHeight: 1.75, marginBottom: 20, maxWidth: 280 }}>
                Portefeuille virtuel multi-opérateurs et paiement par QR Code pour les commerçants camerounais.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['f', 'in', 'tw'].map(s => (
                  <a key={s} href="#" className="pq-social">{s}</a>
                ))}
              </div>
            </div>

            {/* Plateforme */}
            <div>
              <h4 style={{ ...Heading, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 20 }}>Plateforme</h4>
              <a href="#flux"      className="pq-footer-link">Comment ça marche</a>
              <a href="#avantages" className="pq-footer-link">Avantages</a>
              <a href="#roles"     className="pq-footer-link">Rôles</a>
              <Link to="/login"    className="pq-footer-link">Se connecter</Link>
            </div>

            {/* Technologie */}
            <div>
              <h4 style={{ ...Heading, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 20 }}>Technologie</h4>
              {['Spring Boot', 'Flutter (Mobile)', 'React TypeScript', 'Aangaraa-Pay', 'MySQL'].map(t => (
                <span key={t} className="pq-footer-link" style={{ cursor: 'default' }}>{t}</span>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ ...Heading, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 20 }}>Contact</h4>
              {[
                { icon: '📧', text: 'contact@payqr.cm',          href: 'mailto:contact@payqr.cm' },
                { icon: '📞', text: '+237 674 506 841',           href: 'tel:+237674506841'       },
                { icon: '📍', text: 'Yaoundé · Quartier Melen',  href: '#'                       },
              ].map((c, i) => (
                <a key={i} href={c.href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, textDecoration: 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                    {c.icon}
                  </div>
                  <span style={{ ...S, fontSize: 13, color: '#64748b', marginTop: 5 }}>{c.text}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ ...S, fontSize: 13, color: '#475569' }}>© 2026 PayQr · Développé au sein d'ARITeD · Yaoundé, Cameroun</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
              <span style={{ color: '#16a34a' }}>🔒</span>
              <span style={S}>Sécurisé par JWT · Aangaraa-Pay</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}