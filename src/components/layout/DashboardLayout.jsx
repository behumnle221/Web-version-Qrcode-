import { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Store, QrCode, CreditCard,
  LogOut, Menu, X, ChevronLeft, Bell, Search, Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';

const iconMap = {
  LayoutDashboard, Wallet, Store, QrCode, CreditCard, Users,
};

const navByRole = {
  CLIENT: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/clients', label: 'Mon Espace', icon: 'Wallet' },
    { path: '/payments', label: 'Paiements', icon: 'CreditCard' },
  ],
  VENDEUR: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/vendeurs', label: 'Mon Commerce', icon: 'Store' },
    { path: '/vendeurs/generate-qr', label: 'Générer QR', icon: 'QrCode' },
    { path: '/payments', label: 'Paiements', icon: 'CreditCard' },
  ],
  ADMIN: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/clients', label: 'Clients', icon: 'Users' },
    { path: '/vendeurs', label: 'Vendeurs', icon: 'Store' },
    { path: '/payments', label: 'Paiements', icon: 'CreditCard' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || 'CLIENT';
  const navItems = navByRole[role] || navByRole.CLIENT;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${sidebarOpen ? 'px-6' : 'px-4 justify-center'} h-20 border-b border-gray-100 dark:border-gray-800`}>
        <Link to="/dashboard" className="flex items-center group">
          <span className="text-xl font-black tracking-tighter uppercase italic dark:text-white">
            Pay<span className="text-primary-600 not-italic">Qr</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-bold transition-all duration-200
                ${isActive
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 text-sm font-black shadow-sm">
              {user?.nom?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none mb-1">{user?.nom || 'Utilisateur'}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">{role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[15px] font-bold text-danger-500 hover:bg-danger-50 dark:hover:bg-red-900/20 transition-all duration-200 ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-bg-dark flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-72' : 'w-24'} bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 transition-all duration-300 fixed inset-y-0 left-0 z-30`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-7 -right-3 w-6 h-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shadow-xl transition-all"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-24'} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-bg-dark/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between h-20 px-6 lg:px-12">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
              >
                <Menu size={22} />
              </button>
              <div className="hidden md:flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-2.5 min-w-[320px] border border-gray-100 dark:border-gray-800 focus-within:border-primary-500/50 transition-all">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une transaction..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 w-full font-medium"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <button className="relative p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                <Bell size={20} className="text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary-600 border-2 border-white dark:border-bg-dark rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-black shadow-xl shadow-primary-500/20 cursor-pointer">
                  {user?.nom?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
