import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { vendeurService } from '../../api/vendeurService';
import { QrCode, CheckCircle2, Clock, TrendingUp, Hash, RefreshCw, ArrowRight } from 'lucide-react';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');

  .cd-root { padding: 0; font-family: 'Inter', sans-serif; }

  /* ── Welcome banner ── */
  .cd-banner {
    background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 20px;
    flex-wrap: wrap;
  }
  .cd-banner-avatar {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 800; color: #fff; flex-shrink: 0;
  }
  .cd-banner-text { flex: 1; }
  .cd-banner-text h2 {
    font-family: 'Sora', sans-serif;
    font-size: 20px; font-weight: 800; color: #f1f5f9; margin: 0 0 4px;
  }
  .cd-banner-text p { font-size: 13px; color: #94a3b8; margin: 0; }
  .cd-qr-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px; border: none;
    background: #2563eb; color: #fff;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(37,99,235,.35);
    white-space: nowrap;
  }
  .cd-qr-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

  /* ── Stat cards ── */
  .cd-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  .cd-stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px 20px 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s;
  }
  .cd-stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .dark .cd-stat-card { background: #1e293b; border-color: #334155; }
  .cd-stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
  }
  .cd-stat-val {
    font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 2px;
  }
  .dark .cd-stat-val { color: #f1f5f9; }
  .cd-stat-lbl { font-size: 12px; color: #64748b; margin: 0; font-weight: 500; }

  /* ── Table section ── */
  .cd-section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
  }
  .cd-section-head h3 {
    font-family: 'Sora', sans-serif;
    font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;
  }
  .dark .cd-section-head h3 { color: #f1f5f9; }
  .cd-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px; border: 1.5px solid #e2e8f0;
    background: none; font-size: 12px; font-weight: 600; color: #64748b;
    cursor: pointer; transition: all 0.15s;
  }
  .cd-refresh-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
  .dark .cd-refresh-btn { border-color: #334155; color: #94a3b8; }
  .dark .cd-refresh-btn:hover { background: #0f172a; }

  .cd-table-wrap {
    background: #fff;
    border-radius: 16px; border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .dark .cd-table-wrap { background: #1e293b; border-color: #334155; }

  .cd-table { width: 100%; border-collapse: collapse; }
  .cd-table th {
    padding: 12px 16px; text-align: left;
    font-size: 11px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.07em;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  }
  .dark .cd-table th { background: #0f172a; border-color: #334155; color: #475569; }
  .cd-table td {
    padding: 14px 16px; font-size: 14px; color: #0f172a;
    border-bottom: 1px solid #f1f5f9;
  }
  .dark .cd-table td { color: #e2e8f0; border-color: #1e293b; }
  .cd-table tr:last-child td { border-bottom: none; }
  .cd-table tr:hover td { background: #f8fafc; }
  .dark .cd-table tr:hover td { background: #0f172a; }

  .cd-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 12px; font-weight: 700;
  }
  .cd-status.paid { background: #dcfce7; color: #16a34a; }
  .cd-status.pending { background: #fef3c7; color: #d97706; }

  .cd-amount { font-weight: 700; color: #0f172a; }
  .dark .cd-amount { color: #f1f5f9; }

  .cd-empty-row td {
    text-align: center; padding: 48px 16px;
    color: #94a3b8; font-size: 14px;
  }
  .cd-loading { text-align: center; padding: 60px; color: #94a3b8; font-size: 14px; }
`;

/* ─── Helpers ─── */
function fmt(n) {
  return (Number(n) || 0).toLocaleString('fr-FR') + ' XAF';
}

function fmtDate(dt) {
  if (!dt) return '–';
  const d = new Date(dt);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function isToday(dt) {
  if (!dt) return false;
  const d = new Date(dt);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

export default function CaissierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendeurService.getMesQrCodes();
      setQrCodes(Array.isArray(data) ? data : []);
    } catch {
      setQrCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const initials = (user?.nom || user?.email || 'C').charAt(0).toUpperCase();
  const nomCaisse = user?.nom || user?.nomCaisse || 'Ma caisse';

  // Stats
  const todayQrs = qrCodes.filter(q => isToday(q.dateCreation));
  const todayPaid = todayQrs.filter(q => q.estUtilise);
  const todayTotal = todayPaid.reduce((s, q) => s + (Number(q.montant) || 0), 0);
  const totalGeneres = qrCodes.length;

  return (
    <>
      <style>{CSS}</style>
      <div className="cd-root">

        {/* ── Banner ── */}
        <div className="cd-banner">
          <div className="cd-banner-avatar">{initials}</div>
          <div className="cd-banner-text">
            <h2>Bonjour, {nomCaisse} 👋</h2>
            <p>Voici le résumé de votre activité. Bonne journée !</p>
          </div>
          <button className="cd-qr-btn" onClick={() => navigate('/caissier/qr')}>
            <QrCode size={16} /> Nouveau QR Code <ArrowRight size={14} />
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="cd-stats">
          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: '#dbeafe' }}>
              <TrendingUp size={20} color="#2563eb" />
            </div>
            <p className="cd-stat-val" style={{ color: '#2563eb' }}>{fmt(todayTotal)}</p>
            <p className="cd-stat-lbl">Encaissé aujourd'hui</p>
          </div>
          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: '#dcfce7' }}>
              <CheckCircle2 size={20} color="#16a34a" />
            </div>
            <p className="cd-stat-val" style={{ color: '#16a34a' }}>{todayPaid.length}</p>
            <p className="cd-stat-lbl">Paiements validés aujourd'hui</p>
          </div>
          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: '#fef3c7' }}>
              <Clock size={20} color="#d97706" />
            </div>
            <p className="cd-stat-val" style={{ color: '#d97706' }}>
              {todayQrs.length - todayPaid.length}
            </p>
            <p className="cd-stat-lbl">En attente aujourd'hui</p>
          </div>
          <div className="cd-stat-card">
            <div className="cd-stat-icon" style={{ background: '#f3e8ff' }}>
              <Hash size={20} color="#7c3aed" />
            </div>
            <p className="cd-stat-val" style={{ color: '#7c3aed' }}>{totalGeneres}</p>
            <p className="cd-stat-lbl">Total QR générés</p>
          </div>
        </div>

        {/* ── Table historique ── */}
        <div className="cd-section-head">
          <h3>Mes QR Codes générés</h3>
          <button className="cd-refresh-btn" onClick={load}>
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>

        <div className="cd-table-wrap">
          {loading ? (
            <div className="cd-loading">Chargement…</div>
          ) : (
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Date / Heure</th>
                  <th>Description</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.length === 0 ? (
                  <tr className="cd-empty-row">
                    <td colSpan={4}>
                      <QrCode size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                      Aucun QR code généré pour le moment
                    </td>
                  </tr>
                ) : (
                  qrCodes.map((q) => (
                    <tr key={q.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#64748b' }}>
                        {fmtDate(q.dateCreation)}
                      </td>
                      <td style={{ color: '#475569', fontSize: '13px' }}>
                        {q.description || '—'}
                      </td>
                      <td className="cd-amount">{fmt(q.montant)}</td>
                      <td>
                        {q.estUtilise ? (
                          <span className="cd-status paid">
                            <CheckCircle2 size={12} /> Payé
                          </span>
                        ) : (
                          <span className="cd-status pending">
                            <Clock size={12} /> En attente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
