import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Store, Mail, Phone, MapPin, User, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CSS = `
  .vp-root { animation: vp-in 0.3s ease-out; max-width: 640px; }
  @keyframes vp-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .vp-card {
    background: #fff; border-radius: 20px;
    border: 1px solid #e2e8f0; padding: 1.75rem; margin-bottom: 1.25rem;
  }
  .dark .vp-card { background: #0f172a; border-color: #1e293b; }

  .vp-card-title {
    font-family: 'Sora', sans-serif;
    font-size: 15px; font-weight: 800; color: #0f172a;
    margin-bottom: 1.25rem;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .vp-card-title { color: #f1f5f9; }

  .vp-avatar-row {
    display: flex; align-items: center; gap: 1.25rem;
    margin-bottom: 1.5rem;
  }
  .vp-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800;
    color: #fff; flex-shrink: 0;
    box-shadow: 0 6px 20px rgba(37,99,235,.25);
  }
  .vp-avatar-info {}
  .vp-avatar-name { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; }
  .dark .vp-avatar-name { color: #f1f5f9; }
  .vp-avatar-role {
    font-size: 12px; font-weight: 600; color: #fff;
    background: #2563eb; padding: 3px 10px; border-radius: 20px;
    display: inline-block; margin-top: 5px;
  }

  .vp-info-row {
    display: flex; align-items: center; gap: 10px;
    padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;
  }
  .dark .vp-info-row { border-color: #1e293b; }
  .vp-info-row:last-child { border-bottom: none; }
  .vp-info-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #eff6ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .vp-info-label { font-size: 11px; color: #94a3b8; font-weight: 500; }
  .vp-info-value { font-size: 14px; font-weight: 600; color: #0f172a; }
  .dark .vp-info-value { color: #e2e8f0; }

  .vp-security-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;
  }
  .dark .vp-security-item { border-color: #1e293b; }
  .vp-security-item:last-child { border-bottom: none; }
  .vp-security-left { display: flex; align-items: center; gap: 10px; }
  .vp-security-label { font-size: 14px; font-weight: 600; color: #0f172a; }
  .dark .vp-security-label { color: #e2e8f0; }
  .vp-security-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

  .vp-btn-ghost {
    height: 36px; padding: 0 1rem; border-radius: 10px;
    border: 1.5px solid #e2e8f0; background: #fff;
    font-size: 13px; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s;
  }
  .vp-btn-ghost:hover { border-color: #2563eb; color: #2563eb; }

  .vp-logout-btn {
    display: flex; align-items: center; gap: 8px;
    width: 100%; height: 48px; padding: 0 1.25rem;
    background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 14px;
    font-size: 14px; font-weight: 700; color: #dc2626;
    cursor: pointer; transition: all 0.15s;
  }
  .vp-logout-btn:hover { background: #fee2e2; }

  .vp-jwt-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 20px;
    background: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 700;
    border: 1px solid #bbf7d0;
  }
`;

export default function VendeurParametres() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const initials = (user?.nomCommerce || user?.nom || 'V').charAt(0).toUpperCase();

  return (
    <div className="vp-root">
      <style>{CSS}</style>

      {/* Profile card */}
      <div className="vp-card">
        <div className="vp-card-title"><User size={16} color="#2563eb" /> Profil du commerce</div>

        <div className="vp-avatar-row">
          <div className="vp-avatar">{initials}</div>
          <div className="vp-avatar-info">
            <div className="vp-avatar-name">{user?.nomCommerce || user?.nom || '—'}</div>
            <span className="vp-avatar-role">Commerçant PayQr</span>
          </div>
        </div>

        <div className="vp-info-row">
          <div className="vp-info-icon"><Store size={16} color="#2563eb" /></div>
          <div>
            <div className="vp-info-label">Nom du commerce</div>
            <div className="vp-info-value">{user?.nomCommerce || '—'}</div>
          </div>
        </div>
        <div className="vp-info-row">
          <div className="vp-info-icon"><User size={16} color="#2563eb" /></div>
          <div>
            <div className="vp-info-label">Nom complet</div>
            <div className="vp-info-value">{user?.nom || '—'}</div>
          </div>
        </div>
        <div className="vp-info-row">
          <div className="vp-info-icon"><Mail size={16} color="#2563eb" /></div>
          <div>
            <div className="vp-info-label">Adresse email</div>
            <div className="vp-info-value">{user?.email || '—'}</div>
          </div>
        </div>
        <div className="vp-info-row">
          <div className="vp-info-icon"><Phone size={16} color="#2563eb" /></div>
          <div>
            <div className="vp-info-label">Téléphone</div>
            <div className="vp-info-value">{user?.telephone || '—'}</div>
          </div>
        </div>
        {user?.adresse && (
          <div className="vp-info-row">
            <div className="vp-info-icon"><MapPin size={16} color="#2563eb" /></div>
            <div>
              <div className="vp-info-label">Adresse</div>
              <div className="vp-info-value">{user.adresse}</div>
            </div>
          </div>
        )}
      </div>

      {/* Security card */}
      <div className="vp-card">
        <div className="vp-card-title"><Shield size={16} color="#2563eb" /> Sécurité et Session</div>

        <div className="vp-security-item">
          <div className="vp-security-left">
            <div className="vp-info-icon"><Shield size={16} color="#2563eb" /></div>
            <div>
              <div className="vp-security-label">Authentification JWT</div>
              <div className="vp-security-sub">Token valide 24h · Renouvellement automatique</div>
            </div>
          </div>
          <span className="vp-jwt-chip">● Actif</span>
        </div>

        <div className="vp-security-item">
          <div className="vp-security-left">
            <div className="vp-info-icon"><User size={16} color="#7c3aed" /></div>
            <div>
              <div className="vp-security-label">Rôle du compte</div>
              <div className="vp-security-sub">Accès aux endpoints VENDEUR</div>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: 20, border: '1px solid #ddd6fe' }}>
            VENDEUR
          </span>
        </div>

        <div className="vp-security-item">
          <div className="vp-security-left">
            <div className="vp-info-icon"><Shield size={16} color="#16a34a" /></div>
            <div>
              <div className="vp-security-label">Mot de passe</div>
              <div className="vp-security-sub">Modifiez votre mot de passe de connexion</div>
            </div>
          </div>
          <button className="vp-btn-ghost">Modifier</button>
        </div>
      </div>

      {/* Logout */}
      <button className="vp-logout-btn" onClick={handleLogout}>
        <LogOut size={16} />
        Se déconnecter de l'espace commerçant
      </button>
    </div>
  );
}
