import React, { useState, useEffect } from 'react';
import { Plus, UserX, UserCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendeurService } from '../../api/vendeurService';
import './VendeurCaisses.css';

const VendeurCaisses = () => {
  const [caisses, setCaisses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nomCaisse: '', email: '', password: '' });

  const loadCaisses = async () => {
    try {
      setLoading(true);
      const res = await vendeurService.getCaisses();
      setCaisses(res?.data || res);
    } catch (err) {
      toast.error('Erreur lors du chargement des caisses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaisses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await vendeurService.createCaisse(formData);
      toast.success('Caisse créée avec succès !');
      setIsModalOpen(false);
      setFormData({ nomCaisse: '', email: '', password: '' });
      loadCaisses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création de la caisse');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await vendeurService.toggleCaisse(id);
      toast.success(res.message || 'Statut mis à jour');
      loadCaisses();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="vendeur-caisses">
      <div className="caisses-header">
        <div>
          <h2>Gestion des Caisses</h2>
          <p>Créez des accès limités pour vos employés.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nouvelle Caisse
        </button>
      </div>

      <div className="caisses-list">
        {loading ? (
          <p>Chargement...</p>
        ) : caisses.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} className="empty-icon" />
            <h3>Aucune caisse configurée</h3>
            <p>Créez une caisse pour permettre à vos employés d'encaisser sans accéder à votre solde.</p>
          </div>
        ) : (
          <div className="caisses-grid">
            {caisses.map((caisse) => (
              <div key={caisse.id} className={`caisse-card ${!caisse.actif ? 'inactive' : ''}`}>
                <div className="caisse-info">
                  <h3>{caisse.nomCaisse}</h3>
                  <span className="caisse-email">{caisse.email}</span>
                </div>
                <div className="caisse-actions">
                  <span className={`status-badge ${caisse.actif ? 'active' : 'inactive'}`}>
                    {caisse.actif ? 'Actif' : 'Suspendu'}
                  </span>
                  <button 
                    className={`btn-icon ${caisse.actif ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggle(caisse.id)}
                    title={caisse.actif ? 'Désactiver' : 'Activer'}
                  >
                    {caisse.actif ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Créer une nouvelle Caisse</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nom de la Caisse (ex: Caisse Boulangerie)</label>
                <input 
                  type="text" 
                  required 
                  value={formData.nomCaisse}
                  onChange={(e) => setFormData({...formData, nomCaisse: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email de connexion (ex: caisse1@magasin.com)</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input 
                  type="text" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendeurCaisses;
