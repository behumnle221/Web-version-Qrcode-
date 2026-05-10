import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'primary', className = '' }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/30',
      icon: 'text-primary-600 dark:text-primary-400',
      border: 'border-primary-100 dark:border-primary-800',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-100 dark:border-orange-800',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-100 dark:border-yellow-800',
    },
    success: {
      bg: 'bg-success-50 dark:bg-green-900/30',
      icon: 'text-success-600 dark:text-green-400',
      border: 'border-green-100 dark:border-green-800',
    },
    danger: {
      bg: 'bg-danger-50 dark:bg-red-900/30',
      icon: 'text-danger-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-800',
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`bg-white dark:bg-surface-dark rounded-2xl border ${c.border} p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-success-500' : 'text-danger-500'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${c.bg} p-3 rounded-xl`}>
            <Icon size={24} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
