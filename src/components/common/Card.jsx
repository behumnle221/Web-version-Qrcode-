export default function Card({ children, className = '', hover = false, padding = true, ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-surface-dark
        rounded-2xl border border-gray-100 dark:border-gray-800
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : 'shadow-sm'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
