export default function Badge({ status, className = '' }) {
  const statusMap = {
    SUCCESS: { label: 'Réussi', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    SUCCESSFUL: { label: 'Réussi', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    PENDING: { label: 'En attente', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
    FAILED: { label: 'Échoué', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
    EXPIRED: { label: 'Expiré', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
    CANCELLED: { label: 'Annulé', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
    ACTIVE: { label: 'Actif', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  };

  const s = statusMap[status] || statusMap.PENDING;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
