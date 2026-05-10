import { ShieldCheck, Users, Settings, Activity } from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panneau Administration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestion globale de la plateforme PayQr</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Utilisateurs" value="1,284" icon={Users} color="primary" />
        <StatCard title="Transactions" value="45,902" icon={Activity} color="success" />
        <StatCard title="Commerçants" value="156" icon={ShieldCheck} color="orange" />
        <StatCard title="Alertes" value="3" icon={Settings} color="danger" />
      </div>

      <Card className="p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 border-dashed border-2">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="text-primary-600 w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue, Administrateur</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Ceci est votre panneau de contrôle. Vous pouvez gérer les utilisateurs, surveiller les transactions et configurer les paramètres du système.
        </p>
      </Card>
    </div>
  );
}
