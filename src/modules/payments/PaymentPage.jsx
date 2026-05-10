import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, ArrowRight, Smartphone } from 'lucide-react';
import { paymentService } from '../../api/paymentService';
import { qrCodeService } from '../../api/qrCodeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';
import { OPERATORS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [qrCodeId, setQrCodeId] = useState('');
  const [qrInfo, setQrInfo] = useState(null);
  const [paymentType, setPaymentType] = useState('virtual');
  const [operator, setOperator] = useState('Orange_Cameroon');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const handleValidateQr = async () => {
    if (!qrCodeId) return toast.error('Entrez un ID de QR Code');
    setValidating(true);
    try {
      const result = await qrCodeService.validate(qrCodeId);
      const data = result.data || result;
      if (data.valide === false) {
        toast.error(data.message || 'QR Code invalide');
        return;
      }
      setQrInfo(data);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR Code introuvable');
    } finally {
      setValidating(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      let result;
      if (paymentType === 'virtual') {
        result = await paymentService.virtualPayment({
          qrCodeId: Number(qrCodeId),
          montant: qrInfo.montant,
        });
      } else {
        if (!telephone) return toast.error('Entrez votre numéro de téléphone');
        result = await paymentService.initiatePayment({
          qrCodeId: Number(qrCodeId),
          telephoneClient: telephone,
          operator,
          montant: qrInfo.montant,
          directPayment: true,
          transactionType: 'PAYMENT_MARCHAND',
        });
      }

      const data = result.data || result;
      if (data.success) {
        toast.success(data.message || 'Paiement réussi !');
        if (data.transactionId) {
          navigate(`/payments/${data.transactionId}/status`);
        } else {
          setStep(3);
        }
      } else {
        toast.error(data.message || 'Échec du paiement');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Effectuer un Paiement</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Scannez ou saisissez un QR code pour payer</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} className="text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scanner un QR Code</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entrez l'identifiant du QR code</p>
          </div>
          <Input
            id="pay-qr-id"
            label="ID du QR Code"
            placeholder="ex: 28"
            value={qrCodeId}
            onChange={(e) => setQrCodeId(e.target.value)}
            icon={QrCode}
          />
          <Button fullWidth size="lg" icon={ArrowRight} loading={validating} onClick={handleValidateQr} className="mt-4">
            Vérifier le QR Code
          </Button>
        </Card>
      )}

      {step === 2 && qrInfo && (
        <div className="space-y-4 animate-fade-in">
          {/* QR Code Info */}
          <Card className="bg-primary-50 dark:bg-primary-900/20 !border-primary-200 dark:!border-primary-800">
            <div className="text-center">
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">Montant à payer</p>
              <p className="text-3xl font-bold text-primary-800 dark:text-primary-200 mt-1">{formatCurrency(qrInfo.montant)}</p>
              {qrInfo.description && <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">{qrInfo.description}</p>}
              {qrInfo.vendeurNom && <p className="text-xs text-primary-500 mt-1">Vendeur : {qrInfo.vendeurNom}</p>}
            </div>
          </Card>

          {/* Payment method */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mode de paiement</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentType('virtual')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentType === 'virtual' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <CreditCard size={22} className={paymentType === 'virtual' ? 'text-primary-500' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Solde Virtuel</p>
                  <p className="text-xs text-gray-500">Paiement instantané depuis votre solde</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('mobile')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentType === 'mobile' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Smartphone size={22} className={paymentType === 'mobile' ? 'text-primary-500' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Mobile Money</p>
                  <p className="text-xs text-gray-500">Orange Money ou MTN MoMo</p>
                </div>
              </button>
            </div>
          </Card>

          {paymentType === 'mobile' && (
            <Card className="animate-fade-in">
              <div className="space-y-4">
                <div className="flex gap-3">
                  {OPERATORS.map(op => (
                    <button
                      key={op.value}
                      type="button"
                      onClick={() => setOperator(op.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        operator === op.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: op.color }}>
                        {op.label[0]}
                      </div>
                      {op.label}
                    </button>
                  ))}
                </div>
                <Input
                  id="pay-telephone"
                  label="Numéro de téléphone"
                  placeholder="+237 6XX XXX XXX"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div>
            </Card>
          )}

          <Button fullWidth size="lg" loading={loading} onClick={handlePayment}>
            Payer {formatCurrency(qrInfo.montant)}
          </Button>
          <Button fullWidth variant="ghost" onClick={() => setStep(1)}>Retour</Button>
        </div>
      )}

      {step === 3 && (
        <Card className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-success-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Paiement Réussi !</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Votre paiement a été effectué avec succès.</p>
          <Button fullWidth onClick={() => navigate('/dashboard')}>Retour au Dashboard</Button>
        </Card>
      )}
    </div>
  );
}
