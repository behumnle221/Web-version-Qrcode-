import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { PageLoader } from './components/common/Loader';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth
import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';
import ForgotPasswordPage from './modules/auth/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/ResetPasswordPage';

// Landing
import LandingPage from './modules/landing/LandingPage';

// Dashboard générique
import DashboardPage from './modules/dashboard/DashboardPage';

// Clients
import ClientLayout from './modules/clients/ClientLayout';
import ClientHome from './modules/clients/ClientHome';
import ClientScanQR from './modules/clients/ClientScanQR';
import ClientTransactions from './modules/clients/ClientTransactions';
import ClientRecharge from './modules/clients/ClientRecharge';
import ClientRetraits from './modules/clients/ClientRetraits';

// ── VENDEUR (nouveau module complet) ──────────────────────────────────────────
import VendeurLayout from './modules/vendeurs/VendeurLayout';
import VendeurHome from './modules/vendeurs/VendeurHome';
import VendeurQrManager from './modules/vendeurs/VendeurQrManager';
import VendeurRetraits from './modules/vendeurs/VendeurRetraits';
import VendeurTransactions from './modules/vendeurs/VendeurTransactions';
import VendeurParametres from './modules/vendeurs/VendeurParametres';
import VendeurCaisses from './modules/vendeurs/VendeurCaisses';
import CaissierLayout from './modules/caissier/CaissierLayout';
import CaissierDashboard from './modules/caissier/CaissierDashboard';

// Admin
import AdminDashboard from './modules/admin/AdminDashboard';

// Payments
import PaymentPage from './modules/payments/PaymentPage';
import PaymentStatusPage from './modules/payments/PaymentStatusPage';

// Docs
import TestApiPage from './modules/docs/TestApiPage';
import ApiDocsPage from './modules/docs/ApiDocsPage';

// ── Guards ────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated && user) {
    if (user.role === 'VENDEUR') return <Navigate to="/vendeurs" replace />;
    if (user.role === 'CLIENT') return <Navigate to="/clients" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'CAISSIER') return <Navigate to="/caissier" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #1E293B)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth ── */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
        </Route>

        {/* ── VENDEUR (layout propre avec sidebar) ── */}
        <Route
          path="/vendeurs"
          element={<ProtectedRoute><VendeurLayout /></ProtectedRoute>}
        >
          <Route index           element={<VendeurHome />} />
          <Route path="qr"       element={<VendeurQrManager />} />
          <Route path="retraits" element={<VendeurRetraits />} />
          <Route path="transactions" element={<VendeurTransactions />} />
          <Route path="caisses"  element={<VendeurCaisses />} />
          <Route path="parametres"   element={<VendeurParametres />} />
        </Route>

        {/* ── CLIENT (layout propre avec sidebar) ── */}
        <Route
          path="/clients"
          element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}
        >
          <Route index                  element={<ClientHome />} />
          <Route path="scanner"         element={<ClientScanQR />} />
          <Route path="transactions"    element={<ClientTransactions />} />
          <Route path="recharge"        element={<ClientRecharge />} />
          <Route path="retraits"        element={<ClientRetraits />} />
        </Route>

        {/* ── Autres routes protégées (layout générique) ── */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin"     element={<AdminDashboard />} />
          <Route path="/payments"  element={<PaymentPage />} />
          <Route path="/payments/:id/status" element={<PaymentStatusPage />} />
          <Route path="/test-api"  element={<TestApiPage />} />
          <Route path="/api-docs"  element={<ApiDocsPage />} />
        </Route>

        {/* ── CAISSIER ── */}
        <Route
          path="/caissier"
          element={<ProtectedRoute><CaissierLayout /></ProtectedRoute>}
        >
          <Route index      element={<CaissierDashboard />} />
          <Route path="qr" element={<VendeurQrManager />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
