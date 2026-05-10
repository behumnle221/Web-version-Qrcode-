export default function Loader({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader size="lg" />
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Chargement...</p>
    </div>
  );
}
