export function AuthDecorPanel() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center bg-primary text-primary-foreground p-12 relative overflow-hidden">
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-10">
        <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="160" y1="400" x2="160" y2="180" stroke="currentColor" strokeWidth="2" />
        <line x1="200" y1="400" x2="200" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="240" y1="400" x2="240" y2="170" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="160" cy="170" rx="8" ry="15" fill="currentColor" opacity="0.3" />
        <ellipse cx="200" cy="140" rx="8" ry="15" fill="currentColor" opacity="0.3" />
        <ellipse cx="240" cy="160" rx="8" ry="15" fill="currentColor" opacity="0.3" />
        <rect x="80" y="350" width="240" height="10" rx="5" fill="currentColor" opacity="0.15" />
        <rect x="100" y="365" width="200" height="8" rx="4" fill="currentColor" opacity="0.1" />
        <rect x="120" y="378" width="160" height="6" rx="3" fill="currentColor" opacity="0.07" />
      </svg>
      <div className="relative z-10 text-center">
        <blockquote className="text-xl font-light italic max-w-xs leading-relaxed mb-8">
          "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways."
        </blockquote>
        <p className="text-sm opacity-70">— John F. Kennedy</p>
        <div className="flex gap-2 mt-10 justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-foreground opacity-100" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-foreground opacity-40" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-foreground opacity-40" />
        </div>
      </div>
    </div>
  );
}
