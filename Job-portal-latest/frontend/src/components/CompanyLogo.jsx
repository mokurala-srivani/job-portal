const PALETTES = [
  { bg: '2563eb', fg: 'ffffff' },
  { bg: '0ea5e9', fg: 'ffffff' },
  { bg: '8b5cf6', fg: 'ffffff' },
  { bg: '10b981', fg: 'ffffff' },
  { bg: 'f59e0b', fg: '0f172a' },
  { bg: 'ef4444', fg: 'ffffff' },
  { bg: 'ec4899', fg: 'ffffff' },
  { bg: '14b8a6', fg: 'ffffff' },
];

const hash = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

export default function CompanyLogo({ name = '', size = 44, className = '' }) {
  const palette = PALETTES[hash(name) % PALETTES.length];
  const url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${palette.bg}&textColor=${palette.fg}&fontWeight=700&radius=20`;
  return (
    <img
      src={url}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      className={`shrink-0 rounded-xl ring-1 ring-slate-200 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
