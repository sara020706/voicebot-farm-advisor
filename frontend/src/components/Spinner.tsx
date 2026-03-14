export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spinner ${className}`} />
  );
}
