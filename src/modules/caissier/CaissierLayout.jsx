import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  QrCode, LogOut, Store, Menu, X
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

// On réutilise une partie du CSS du vendeur
import '../vendeurs/VendeurLayout';

const NAV = [
  { to: '/caissier', label: 'Générer un QR Code', Icon: QrCode, end: true },
];

const PAGE_TITLES = {
  '/caissier': 'Générer un QR Code',
};

export default function CaissierLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Espace Caisse';
  const initials = (user?.nom || user?.email || 'C').charAt(0).toUpperCase();
  const nomCommerce = user?.nom || 'Caisse';

  const NavItems = ({ onClose }) => (
    <>
      <div className="vl-nav-label">Caisse</div>
      {NAV.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `vl-nav-item${isActive ? ' active' : ''}`}
          onClick={onClose}
        >
          <Icon className="vl-nav-icon" />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="vl-root">
      <aside className="vl-sidebar">
        <div className="vl-sidebar-inner">
          <div className="vl-logo">
            <div className="vl-logo-icon">
              <Store size={20} color="white" />
            </div>
            <span className="vl-logo-text">Pay<span>Qr</span></span>
          </div>

          <NavItems onClose={() => {}} />

          <div className="vl-sidebar-footer">
            <div className="vl-user-card">
              <div className="vl-user-avatar">{initials}</div>
              <div>
                <div className="vl-user-name">{nomCommerce}</div>
                <div className="vl-user-role">Caissier</div>
              </div>
            </div>
            <button className="vl-nav-item" onClick={handleLogout} style={{ color: '#f87171', width: '100%' }}>
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      {drawerOpen && (
        <>
          <div className="vl-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="vl-drawer">
            <button className="vl-drawer-close" onClick={() => setDrawerOpen(false)}>
              <X size={16} />
            </button>
            <div className="vl-logo" style={{ paddingTop: 0, marginTop: '2rem' }}>
              <div className="vl-logo-icon">
                <Store size={20} color="white" />
              </div>
              <span className="vl-logo-text">Pay<span>Qr</span></span>
            </div>
            <NavItems onClose={() => setDrawerOpen(false)} />
            <div className="vl-sidebar-footer">
              <div className="vl-user-card">
                <div className="vl-user-avatar">{initials}</div>
                <div>
                  <div className="vl-user-name">{nomCommerce}</div>
                  <div className="vl-user-role">Caissier</div>
                </div>
              </div>
              <button className="vl-nav-item" onClick={handleLogout} style={{ color: '#f87171', width: '100%' }}>
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}

      <main className="vl-main">
        <header className="vl-topbar">
          <div className="vl-topbar-left">
            <button className="vl-menu-btn" onClick={() => setDrawerOpen(true)}>
              <Menu size={18} />
            </button>
            <span className="vl-page-title">{pageTitle}</span>
          </div>
          <div className="vl-topbar-right">
            <ThemeToggle />
          </div>
        </header>

        <div className="vl-content">
          <Outlet />
        </div>
      </main>

      <nav className="vl-bottom-nav">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `vl-bn-item${isActive ? ' active' : ''}`}
          >
            <div className="vl-bn-icon-wrap"><Icon size={18} /></div>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
