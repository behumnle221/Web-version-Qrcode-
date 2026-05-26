import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, QrCode, ArrowDownToLine,
  Receipt, Settings, Bell, LogOut,
  ChevronRight, Menu, X, Wallet, ScanLine
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

/* ─── CSS ───────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cl-root {
    display: flex;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    background: #f8fafc;
  }
  .dark .cl-root { background: #0b1120; }

  /* ── SIDEBAR ── */
  .cl-sidebar {
    display: none;
    width: 260px;
    min-height: 100vh;
    background: #0f172a;
    flex-direction: column;
    position: fixed;
    left: 0; top: 0; bottom: 0;
    z-index: 40;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  @media (min-width: 1024px) { .cl-sidebar { display: flex; } }

  .cl-sidebar-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 1.5rem 1rem;
    gap: 0.5rem;
  }

  .cl-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.5rem 0.75rem 1.5rem;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 0.5rem;
  }
  .cl-logo-icon {
    width: 40px; height: 40px;
    background: #2563eb;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(37,99,235,.3);
    flex-shrink: 0;
  }
  .cl-logo-text {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 800;
    color: #fff; letter-spacing: -0.03em;
    font-style: italic; text-transform: uppercase;
  }
  .cl-logo-text span { color: #60a5fa; font-style: normal; }

  .cl-nav-label {
    font-size: 10px; font-weight: 700;
    color: #475569; text-transform: uppercase;
    letter-spacing: 0.1em; padding: 0.5rem 0.75rem 0.25rem;
  }

  .cl-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.65rem 0.75rem;
    border-radius: 10px;
    text-decoration: none;
    color: #94a3b8;
    font-size: 14px; font-weight: 500;
    transition: all 0.15s;
    cursor: pointer;
    border: none; background: none; width: 100%; text-align: left;
  }
  .cl-nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
  }
  .cl-nav-item.active {
    background: rgba(37,99,235,0.15);
    color: #60a5fa;
    border: 1px solid rgba(37,99,235,0.2);
  }
  .cl-nav-item.active .cl-nav-icon { color: #3b82f6; }

  .cl-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }

  /* CTA principal : Scanner un QR */
  .cl-nav-scan {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.75rem;
    border-radius: 12px;
    margin: 0.5rem 0;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    box-shadow: 0 4px 16px rgba(37,99,235,.3);
    border: none; width: 100%; text-align: left;
  }
  .cl-nav-scan:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,.4); }

  .cl-sidebar-footer {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .cl-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.75rem;
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 0.5rem;
  }
  .cl-user-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; color: #fff;
    flex-shrink: 0;
  }
  .cl-user-name { font-size: 13px; font-weight: 600; color: #e2e8f0; line-height: 1.2; }
  .cl-user-role { font-size: 11px; color: #64748b; }

  /* ── MAIN ── */
  .cl-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  @media (min-width: 1024px) { .cl-main { margin-left: 260px; } }

  /* ── TOPBAR ── */
  .cl-topbar {
    height: 64px;
    padding: 0 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky; top: 0; z-index: 30;
  }
  .dark .cl-topbar { background: #0f172a; border-color: #1e293b; }

  .cl-topbar-left { display: flex; align-items: center; gap: 12px; }
  .cl-topbar-right { display: flex; align-items: center; gap: 12px; }

  .cl-page-title {
    font-family: 'Sora', sans-serif;
    font-size: 17px; font-weight: 700;
    color: #0f172a;
  }
  .dark .cl-page-title { color: #f1f5f9; }

  .cl-menu-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border-radius: 8px; border: none;
    background: #f1f5f9; cursor: pointer;
    color: #475569;
    transition: all 0.15s;
  }
  .cl-menu-btn:hover { background: #e2e8f0; }
  @media (min-width: 1024px) { .cl-menu-btn { display: none; } }

  .cl-notif-btn {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border-radius: 8px; border: none;
    background: #f1f5f9; cursor: pointer;
    color: #475569;
    transition: all 0.15s;
  }
  .cl-notif-btn:hover { background: #e2e8f0; }
  .cl-notif-badge {
    position: absolute; top: 4px; right: 4px;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #ef4444;
    color: #fff; font-size: 9px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }

  /* ── CONTENT ── */
  .cl-content {
    flex: 1;
    padding: 1.5rem;
    padding-bottom: 5rem;
  }
  @media (min-width: 1024px) {
    .cl-content { padding: 2rem 2.5rem; padding-bottom: 2rem; }
  }

  /* ── BOTTOM NAV (Mobile) ── */
  .cl-bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 64px;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    z-index: 40;
    padding: 0 0.5rem;
  }
  .dark .cl-bottom-nav { background: #0f172a; border-color: #1e293b; }
  @media (min-width: 1024px) { .cl-bottom-nav { display: none; } }

  .cl-bn-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0.5rem 0.25rem;
    border-radius: 10px;
    text-decoration: none;
    color: #94a3b8;
    font-size: 10px; font-weight: 600;
    transition: all 0.15s;
    cursor: pointer; border: none; background: none;
  }
  .cl-bn-item:hover { color: #475569; }
  .cl-bn-item.active { color: #2563eb; }
  .cl-bn-item.active .cl-bn-icon-wrap {
    background: rgba(37,99,235,0.1);
  }
  .cl-bn-item.cl-bn-scan { color: #fff; }
  .cl-bn-item.cl-bn-scan .cl-bn-icon-wrap {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(37,99,235,.3);
    width: 44px; height: 44px;
    margin-bottom: -8px;
    border-radius: 14px;
  }

  .cl-bn-icon-wrap {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }

  /* ── MOBILE DRAWER ── */
  .cl-drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 50;
    animation: cl-fadeIn 0.2s;
  }
  .cl-drawer {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 260px;
    background: #0f172a;
    z-index: 51;
    display: flex; flex-direction: column;
    animation: cl-slideIn 0.2s ease-out;
    overflow-y: auto;
    padding: 1.5rem 1rem;
    gap: 0.5rem;
  }
  @keyframes cl-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes cl-slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

  .cl-drawer-close {
    position: absolute; top: 1rem; right: 1rem;
    width: 32px; height: 32px;
    border-radius: 8px; border: none;
    background: rgba(255,255,255,0.08);
    cursor: pointer; color: #94a3b8;
    display: flex; align-items: center; justify-content: center;
  }
`;

const NAV = [
  { to: '/clients',           label: 'Tableau de bord', Icon: LayoutDashboard, end: true },
  { to: '/clients/transactions', label: 'Mes paiements',   Icon: Receipt },
  { to: '/clients/recharge',    label: 'Recharger',        Icon: Wallet },
  { to: '/clients/retraits',    label: 'Retraits',         Icon: ArrowDownToLine },
];

const PAGE_TITLES = {
  '/clients':              'Tableau de bord',
  '/clients/scanner':      'Scanner un QR Code',
  '/clients/transactions': 'Mes paiements',
  '/clients/recharge':     'Recharger mon compte',
  '/clients/retraits':     'Mes retraits',
};

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread] = useState(0);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Espace Client';
  const initials = (user?.nom || user?.email || 'C').charAt(0).toUpperCase();
  const nomClient = user?.nom || user?.email || 'Mon Compte';

  const NavItems = ({ onClose }) => (
    <>
      <div className="cl-nav-label">Navigation</div>

      {/* CTA Scanner QR */}
      <NavLink
        to="/clients/scanner"
        className="cl-nav-scan"
        onClick={onClose}
      >
        <ScanLine size={18} />
        Scanner un QR Code
        <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
      </NavLink>

      {NAV.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `cl-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <Icon className="cl-nav-icon" />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="cl-root">
      <style>{CSS}</style>

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="cl-sidebar">
        <div className="cl-sidebar-inner">
          <a href="/clients" className="cl-logo">
            <div className="cl-logo-icon">
              <QrCode size={20} color="white" />
            </div>
            <span className="cl-logo-text">Pay<span>Qr</span></span>
          </a>

          <NavItems onClose={() => {}} />

          <div className="cl-sidebar-footer">
            <div className="cl-user-card">
              <div className="cl-user-avatar">{initials}</div>
              <div>
                <div className="cl-user-name">{nomClient}</div>
                <div className="cl-user-role">Client</div>
              </div>
            </div>
            <button className="cl-nav-item" onClick={handleLogout} style={{ color: '#f87171', width: '100%' }}>
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {drawerOpen && (
        <>
          <div className="cl-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="cl-drawer">
            <button className="cl-drawer-close" onClick={() => setDrawerOpen(false)}>
              <X size={16} />
            </button>
            <a href="/clients" className="cl-logo" style={{ paddingTop: 0, marginTop: '2rem' }}>
              <div className="cl-logo-icon">
                <QrCode size={20} color="white" />
              </div>
              <span className="cl-logo-text">Pay<span>Qr</span></span>
            </a>
            <NavItems onClose={() => setDrawerOpen(false)} />
            <div className="cl-sidebar-footer">
              <div className="cl-user-card">
                <div className="cl-user-avatar">{initials}</div>
                <div>
                  <div className="cl-user-name">{nomClient}</div>
                  <div className="cl-user-role">Client</div>
                </div>
              </div>
              <button className="cl-nav-item" onClick={handleLogout} style={{ color: '#f87171', width: '100%' }}>
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MAIN ── */}
      <main className="cl-main">
        {/* Topbar */}
        <header className="cl-topbar">
          <div className="cl-topbar-left">
            <button className="cl-menu-btn" onClick={() => setDrawerOpen(true)}>
              <Menu size={18} />
            </button>
            <span className="cl-page-title">{pageTitle}</span>
          </div>
          <div className="cl-topbar-right">
            <ThemeToggle />
            <button className="cl-notif-btn">
              <Bell size={18} />
              {unread > 0 && (
                <span className="cl-notif-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="cl-content">
          <Outlet />
        </div>
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="cl-bottom-nav">
        {NAV.slice(0, 2).map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `cl-bn-item${isActive ? ' active' : ''}`}
          >
            <div className="cl-bn-icon-wrap"><Icon size={18} /></div>
            {label}
          </NavLink>
        ))}

        {/* Centre : Scanner QR */}
        <NavLink to="/clients/scanner" className={({ isActive }) => `cl-bn-item cl-bn-scan${isActive ? ' active' : ''}`}>
          <div className="cl-bn-icon-wrap"><ScanLine size={20} /></div>
          Scanner
        </NavLink>

        {NAV.slice(2).map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `cl-bn-item${isActive ? ' active' : ''}`}
          >
            <div className="cl-bn-icon-wrap"><Icon size={18} /></div>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
