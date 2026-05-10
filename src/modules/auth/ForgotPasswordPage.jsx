import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../../api/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Veuillez saisir votre email');

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Code de réinitialisation envoyé !');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors">
        <ArrowLeft size={16} />
        Retour à la connexion
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Mot de passe oublié ? 🔐
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {sent
            ? 'Un code de réinitialisation a été envoyé à votre email.'
            : 'Entrez votre email pour recevoir un code de réinitialisation.'}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="forgot-email"
            label="Adresse email"
            type="email"
            icon={Mail}
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" fullWidth size="lg" loading={loading} icon={ArrowRight}>
            Envoyer le code
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-success-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ Code envoyé à <strong>{email}</strong>
            </p>
          </div>
          <Link to="/reset-password">
            <Button fullWidth size="lg" icon={ArrowRight}>
              Saisir le code
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
