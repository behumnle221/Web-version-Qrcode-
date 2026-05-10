import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { paymentService } from '../../api/paymentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';

export default function PaymentStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      if (polling) checkStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, polling]);

  const checkStatus = async () => {
    try {
      const result = await paymentService.getLocalStatus(id);
      const data = result.data || result;
      setStatus(data);
      if (data.statut === 'SUCCESS' || data.statut === 'SUCCESSFUL' || data.statut === 'FAILED') {
        setPolling(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = status?.statut === 'SUCCESS' || status?.statut === 'SUCCESSFUL';
  const isFailed = status?.statut === 'FAILED';
  const isPending = !isSuccess && !isFailed;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Card className="text-center">
        {loading ? (
          <div className="py-12">
            <Loader size="lg" />
            <p className="text-gray-500 mt-4">Vérification du paiement...</p>
          </div>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isSuccess ? 'bg-success-50 dark:bg-green-900/30'
              : isFailed ? 'bg-danger-50 dark:bg-red-900/30'
              : 'bg-yellow-50 dark:bg-yellow-900/30'
            }`}>
              {isSuccess && <CheckCircle size={40} className="text-success-500" />}
              {isFailed && <XCircle size={40} className="text-danger-500" />}
              {isPending && <Clock size={40} className="text-yellow-500 animate-pulse" />}
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isSuccess ? 'Paiement Réussi !' : isFailed ? 'Paiement Échoué' : 'Paiement en cours...'}
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Transaction #{id}
            </p>

            {status?.montant && (
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                {formatCurrency(status.montant)}
              </p>
            )}

            {isPending && (
              <div className="mb-6">
                <Loader size="sm" className="mb-2" />
                <p className="text-sm text-gray-500">Vérification automatique en cours...</p>
              </div>
            )}

            <div className="flex gap-3">
              {isPending && (
                <Button variant="secondary" fullWidth icon={RefreshCw} onClick={checkStatus}>
                  Actualiser
                </Button>
              )}
              <Button fullWidth onClick={() => navigate('/dashboard')}>
                {isSuccess ? 'Retour au Dashboard' : 'Fermer'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
