import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listJobs } from '../services/jobs';
import CompanyLogo from '../components/CompanyLogo.jsx';

const CATEGORIES = [
  { name: 'UI/UX Design',     q: 'designer',  count: '1,245 jobs', tint: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', icon: 'design' },
  { name: 'Development',      q: 'engineer',  count: '3,678 jobs', tint: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',           icon: 'code' },
  { name: 'Marketing',        q: 'marketing', count: '1,096 jobs', tint: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', icon: 'mega' },
  { name: 'Sales',            q: 'sales',     count: '1,192 jobs', tint: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',     icon: 'thumb' },
  { name: 'Product',          q: 'product',   count: '1,005 jobs', tint: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',         icon: 'box' },
  { name: 'Customer Support', q: 'support',   count: '876 jobs',   tint: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',         icon: 'chat' },
];

const FLOATING_CARDS = [
  { title: 'UX Designer', company: 'Airbnb', salary: '$85K – $110K', tint: 'bg-rose-100 text-rose-600' },
  { title: 'Software Engineer', company: 'Microsoft', salary: '$110K – $150K', tint: 'bg-sky-100 text-sky-600' },
  { title: 'Marketing Manager', company: 'HubSpot', salary: '$70K – $90K', tint: 'bg-orange-100 text-orange-600' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    listJobs({ limit: 3 }).then((d) => setFeatured(d.items || [])).catch(() => {});
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="section pt-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Over 25,000+ jobs available
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Find the job
              <br />
              that fits <span className="text-gradient">your life</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-slate-600 dark:text-slate-300">
              Discover opportunities, showcase your skills, and build the career you've always wanted.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/jobs" className="btn-primary px-7 py-3 text-sm">Find Jobs</Link>
              <Link to="/register" className="btn border-2 border-brand-600 bg-transparent px-7 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-200 dark:hover:bg-brand-500/10">
                Upload Resume
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <HeroArt cards={FLOATING_CARDS} />
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="section pt-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Popular Categories</h2>
          <Link to="/jobs" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">View all categories</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to={`/jobs?q=${encodeURIComponent(c.q)}`}
              className="card group flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c.tint}`}>
                <CategoryIcon name={c.icon} />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white">{c.name}</div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="section pt-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Jobs</h2>
          <Link to="/jobs" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">View all jobs</Link>
        </div>
        {featured.length === 0 ? (
          <FallbackFeatured />
        ) : (
          <ul className="space-y-3">
            {featured.map((j) => <FeaturedRow key={j._id} job={j} />)}
          </ul>
        )}
      </section>

      {/* CTA TILES */}
      <section className="section py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Create Your Profile', desc: 'Build your profile and showcase your skills', icon: 'user', tint: 'bg-violet-100 text-violet-600' },
            { title: 'Find Your Dream Job', desc: 'Explore thousands of job opportunities',      icon: 'book', tint: 'bg-sky-100 text-sky-600' },
            { title: 'Get Hired & Grow',    desc: 'Connect with top companies and grow your career', icon: 'spark', tint: 'bg-emerald-100 text-emerald-600' },
          ].map((c) => (
            <div key={c.title} className="card flex items-start gap-4 p-5">
              <span className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl ${c.tint}`}>
                <CategoryIcon name={c.icon} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function FeaturedRow({ job }) {
  const salary = (() => {
    const f = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);
    if (job.salaryMin && job.salaryMax) return `${f(job.salaryMin)} - ${f(job.salaryMax)}`;
    if (job.salaryMin || job.salaryMax) return `${f(job.salaryMin || job.salaryMax)}+`;
    return null;
  })();
  const ago = (() => {
    if (!job.createdAt) return '';
    const ms = Date.now() - new Date(job.createdAt).getTime();
    const h = Math.floor(ms / 36e5);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  })();
  return (
    <li className="card flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
      <CompanyLogo name={job.company} size={48} />
      <div className="min-w-0 flex-1">
        <Link to={`/jobs/${job._id}`} className="block truncate font-semibold text-slate-900 hover:text-brand-700 dark:text-white">
          {job.title}
        </Link>
        <p className="truncate text-sm text-slate-600 dark:text-slate-400">
          {job.company} <span className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 text-[8px] text-white">✓</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><DotIcon name="pin" /> {job.location || 'Remote'}</span>
          <span className="inline-flex items-center gap-1"><DotIcon name="clock" /> {job.type || 'Full-time'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 self-stretch sm:self-auto">
        {salary && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {salary}
          </span>
        )}
        <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">{ago}</span>
        <button type="button" aria-label="Save" className="hidden h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 sm:grid dark:border-white/10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </button>
        <Link to={`/jobs/${job._id}`} className="btn-primary px-5 py-2 text-xs">Apply Now</Link>
      </div>
    </li>
  );
}

function FallbackFeatured() {
  const stub = [
    { title: 'Senior UI/UX Designer', company: 'Figma', salary: '$90K - $120K', ago: '2h ago', loc: 'Remote', type: 'Full-time' },
    { title: 'Product Manager',        company: 'Google', salary: '$120K - $160K', ago: '5h ago', loc: 'New York, NY', type: 'Full-time' },
    { title: 'Frontend Developer',     company: 'Slack',  salary: '$80K - $110K', ago: '1d ago', loc: 'Remote', type: 'Full-time' },
  ];
  return (
    <ul className="space-y-3">
      {stub.map((j) => (
        <li key={j.title} className="card flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
          <CompanyLogo name={j.company} size={48} />
          <div className="min-w-0 flex-1">
            <p className="block truncate font-semibold text-slate-900 dark:text-white">{j.title}</p>
            <p className="truncate text-sm text-slate-600 dark:text-slate-400">
              {j.company} <span className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 text-[8px] text-white">✓</span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1"><DotIcon name="pin" /> {j.loc}</span>
              <span className="inline-flex items-center gap-1"><DotIcon name="clock" /> {j.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{j.salary}</span>
            <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">{j.ago}</span>
            <Link to="/jobs" className="btn-primary px-5 py-2 text-xs">Apply Now</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CategoryIcon({ name }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'design': return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'code':   return <svg {...p}><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></svg>;
    case 'mega':   return <svg {...p}><path d="M3 11v2a2 2 0 002 2h2l5 4V5L7 9H5a2 2 0 00-2 2zM18 8a5 5 0 010 8" /></svg>;
    case 'thumb':  return <svg {...p}><path d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v8a2 2 0 002 2h12l4-8a2 2 0 00-2-3z" /></svg>;
    case 'box':    return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M3 11h18M8 7V5a2 2 0 014 0v2" /></svg>;
    case 'chat':   return <svg {...p}><path d="M21 12a8 8 0 11-3-6.2L21 4v6h-6" /></svg>;
    case 'user':   return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>;
    case 'book':   return <svg {...p}><path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4zM4 16a4 4 0 014-4h12" /></svg>;
    case 'spark':  return <svg {...p}><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" /></svg>;
    default: return null;
  }
}

function DotIcon({ name }) {
  const p = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
  if (name === 'pin') return <svg {...p}><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

function HeroArt({ cards }) {
  return (
    <div className="relative h-[440px]">
      {/* purple curved backdrop */}
      <div className="absolute right-4 top-4 h-72 w-72 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-gradient-to-br from-brand-200 to-brand-300 opacity-70 dark:from-brand-500/30 dark:to-brand-700/30" />
      <div className="absolute left-8 bottom-8 h-3 w-3 rounded-full bg-brand-300/60" />
      <div className="absolute left-12 bottom-16 h-2 w-2 rounded-full bg-brand-300/60" />

      {/* center person illustration (SVG persona) */}
      <div className="absolute right-12 top-12 h-72 w-56">
        <PersonaSvg />
      </div>

      {/* floating job cards */}
      <div className="absolute left-0 top-12 w-56 animate-float">
        <FloatingCard {...cards[0]} />
      </div>
      <div className="absolute left-12 top-44 w-60 animate-float" style={{ animationDelay: '1.5s' }}>
        <FloatingCard {...cards[1]} />
      </div>
      <div className="absolute right-0 bottom-8 w-56 animate-float" style={{ animationDelay: '3s' }}>
        <FloatingCard {...cards[2]} />
      </div>

      {/* floating icons */}
      <span className="absolute right-2 top-24 grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a3dff" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      </span>
      <span className="absolute left-1 top-1/2 grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white shadow-glow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>
      </span>
    </div>
  );
}

function FloatingCard({ title, company, salary, tint }) {
  const initials = company?.[0]?.toUpperCase() || 'J';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-ink-900">
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-bold ${tint}`}>{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{company}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-emerald-600">{salary}</p>
    </div>
  );
}

function PersonaSvg() {
  return (
    <svg viewBox="0 0 220 280" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="pp-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c5cff" />
        </linearGradient>
      </defs>
      {/* face */}
      <ellipse cx="110" cy="100" rx="48" ry="56" fill="#fde7d4" />
      <path d="M62 90 Q110 30 158 90 L158 70 Q110 20 62 70 Z" fill="#3b2a52" />
      {/* glasses */}
      <circle cx="92" cy="105" r="11" fill="none" stroke="#1f2937" strokeWidth="2.5" />
      <circle cx="128" cy="105" r="11" fill="none" stroke="#1f2937" strokeWidth="2.5" />
      <path d="M103 105 h14" stroke="#1f2937" strokeWidth="2.5" />
      {/* smile */}
      <path d="M98 130 Q110 142 122 130" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      {/* shoulders/blazer */}
      <path d="M40 280 Q40 200 110 195 Q180 200 180 280 Z" fill="#cbd5e1" />
      <path d="M90 200 L110 240 L130 200 Z" fill="white" />
      {/* laptop */}
      <rect x="40" y="240" width="140" height="20" rx="3" fill="#475569" />
      <rect x="40" y="220" width="140" height="22" rx="3" fill="#1e293b" />
    </svg>
  );
}
