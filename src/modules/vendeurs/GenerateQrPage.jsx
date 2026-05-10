import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Plus, Trash2, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { qrCodeService } from '../../api/qrCodeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function GenerateQrPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([{ name: '', quantity: 1, price: '' }]);
  const [description, setDescription] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);

  const addProduct = () => setProducts([...products, { name: '', quantity: 1, price: '' }]);
  const removeProduct = (i) => setProducts(products.filter((_, idx) => idx !== i));
  const updateProduct = (i, field, value) => {
    const updated = [...products];
    updated[i] = { ...updated[i], [field]: value };
    setProducts(updated);
  };

  const totalMontant = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (products.some(p => !p.name || !p.price)) return toast.error('Remplissez tous les produits');
    if (!dateExpiration) return toast.error("Choisissez une date d'expiration");

    setLoading(true);
    try {
      const data = {
        products: products.map(p => ({ name: p.name, quantity: Number(p.quantity), price: Number(p.price) })),
        description,
        dateExpiration: dateExpiration + 'T23:59:59',
      };
      const result = await qrCodeService.generate(data);
      const qrData = result.data || result;
      setGeneratedQr(qrData);
      toast.success('QR Code généré avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de génération');
    } finally {
      setLoading(false);
    }
  };

  if (generatedQr) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-success-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} className="text-success-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">QR Code Créé !</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Partagez ce QR code avec vos clients</p>
          </div>

          <div className="bg-white p-6 rounded-2xl inline-block shadow-inner mb-6">
            <QRCodeSVG
              value={generatedQr.qrCodeData || generatedQr.contenu || `payqr:${generatedQr.qrCodeId || generatedQr.id}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalMontant.toLocaleString()} XAF</p>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setGeneratedQr(null)}>
              Nouveau QR
            </Button>
            <Button fullWidth icon={ArrowRight} onClick={() => navigate('/vendeurs')}>
              Mon Commerce
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Générer un QR Code</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Ajoutez vos produits et créez un QR code de paiement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Products */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Produits</h3>
          <div className="space-y-4">
            {products.map((p, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    id={`prod-name-${i}`}
                    label={i === 0 ? 'Nom du produit' : ''}
                    placeholder="Produit"
                    value={p.name}
                    onChange={(e) => updateProduct(i, 'name', e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Input
                    id={`prod-qty-${i}`}
                    label={i === 0 ? 'Qté' : ''}
                    type="number"
                    placeholder="1"
                    value={p.quantity}
                    onChange={(e) => updateProduct(i, 'quantity', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Input
                    id={`prod-price-${i}`}
                    label={i === 0 ? 'Prix (XAF)' : ''}
                    type="number"
                    placeholder="0"
                    value={p.price}
                    onChange={(e) => updateProduct(i, 'price', e.target.value)}
                  />
                </div>
                {products.length > 1 && (
                  <button type="button" onClick={() => removeProduct(i)} className="p-2.5 rounded-xl text-danger-500 hover:bg-danger-50 dark:hover:bg-red-900/20 transition-colors mb-0.5">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addProduct} className="mt-3">
            Ajouter un produit
          </Button>
        </Card>

        {/* Details */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Détails</h3>
          <div className="space-y-4">
            <Input
              id="qr-description"
              label="Description"
              placeholder="Description de la commande"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              id="qr-expiration"
              label="Date d'expiration"
              type="date"
              value={dateExpiration}
              onChange={(e) => setDateExpiration(e.target.value)}
            />
          </div>
        </Card>

        {/* Total */}
        <Card className="bg-primary-50 dark:bg-primary-900/20 !border-primary-200 dark:!border-primary-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Montant Total</span>
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">{totalMontant.toLocaleString()} XAF</span>
          </div>
        </Card>

        <Button type="submit" fullWidth size="lg" loading={loading} icon={QrCode}>
          Générer le QR Code
        </Button>
      </form>
    </div>
  );
}
