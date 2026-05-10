import { Outlet, Link } from 'react-router-dom';
import { Zap, Check, QrCode } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-bg-dark">
      
      {/* Branding Side (Desktop) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white border-r border-gray-800">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/40 rounded-full -translate-y-1/4 translate-x-1/4 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#050811] rounded-full translate-y-1/4 -translate-x-1/4 blur-[60px]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <QrCode size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic">
              Pay<span className="text-primary-400 not-italic">Qr</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 mt-12 mb-auto">
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.2] tracking-tight text-white">
            Rejoignez PayQr,<br />
            la plateforme <span className="text-primary-400">tout-en-un</span><br />
            pour vos paiements
          </h1>
          <p className="text-base text-gray-400 leading-relaxed max-w-md">
            Portefeuille virtuel, QR Codes dynamiques et gestion multi-opérateurs — tout dans une seule application.
          </p>
          
          <div className="space-y-5 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-primary-700 flex items-center justify-center shadow-md">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-gray-300 font-medium">QR Codes à usage unique, sécurisés</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-orange-700 flex items-center justify-center shadow-md">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-gray-300 font-medium">Orange Money & MTN MoMo unifiés</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-green-700 flex items-center justify-center shadow-md">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-gray-300 font-medium">Historique et suivi en temps réel</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-900 flex items-center justify-center shadow-md">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-gray-300 font-medium">Sécurisé par JWT multi-rôles</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 pt-8 mt-12">
           <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm transition-colors hover:bg-white/10">
             <div className="w-6 h-6 bg-[#FF6600] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
             </div>
             <span className="text-sm font-bold text-white/90">Orange Money</span>
           </div>
           <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm transition-colors hover:bg-white/10">
             <div className="w-6 h-6 bg-[#FFCC00] rounded-full flex items-center justify-center text-black font-black text-[11px] leading-none">
                M
             </div>
             <span className="text-sm font-bold text-white/90">MTN MoMo</span>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col">
        {/* Header (Mobile Logo + Theme Toggle) */}
        <header className="h-20 px-6 lg:px-12 flex items-center justify-between border-b border-gray-50 lg:border-none dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden group">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic dark:text-white">
              Pay<span className="text-primary-600 not-italic">Qr</span>
            </span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12 xl:p-24">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}
