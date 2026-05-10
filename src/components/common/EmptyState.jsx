import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Aucune donnée', message = '', icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl mb-5">
        <Icon size={40} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {message && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{message}</p>}
      {action}
    </div>
  );
}
