import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../../api/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code) return toast.error('Veuillez saisir le code');
    if (!newPassword) return toast.error('Veuillez saisir un nouveau mot de passe');
    if (newPassword !== confirmPassword) return toast.error('Les mots de passe ne correspondent pas');

    setLoading(true);
    try {
      await authService.resetPassword(code, newPassword);
      toast.success('Mot de passe réinitialisé avec succès !');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors">
        <ArrowLeft size={16} />
        Retour
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Réinitialiser le mot de passe 🔑
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Entrez le code reçu par email et votre nouveau mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="reset-code"
          label="Code de réinitialisation"
          icon={KeyRound}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
        />
        <Input
          id="reset-password"
          label="Nouveau mot de passe"
          type="password"
          icon={Lock}
          placeholder="Minimum 6 caractères"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          id="reset-confirm"
          label="Confirmer le mot de passe"
          type="password"
          icon={Lock}
          placeholder="Répétez le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" fullWidth size="lg" loading={loading} icon={ArrowRight}>
          Réinitialiser
        </Button>
      </form>
    </div>
  );
}
