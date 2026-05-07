export default function Logo({ size = 32, withWordmark = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="jb-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#5a2be0" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#jb-logo)" />
        <path
          d="M22 18h22v6c0 10-5 16-13 16-6 0-10-3-12-8l5-3c1 3 3 5 7 5 4 0 7-3 7-10v-1H22z"
          fill="white"
        />
      </svg>
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Job<span className="text-brand-600">ify</span>
        </span>
      )}
    </span>
  );
}
