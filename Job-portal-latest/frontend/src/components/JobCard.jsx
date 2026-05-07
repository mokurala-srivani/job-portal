import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CompanyLogo from './CompanyLogo.jsx';

const fmtSalary = (min, max) => {
  if (!min && !max) return null;
  const f = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : n);
  if (min && max) return `$${f(min)} – $${f(max)}`;
  return `$${f(min || max)}+`;
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function JobCard({ job, onSave, saved }) {
  const salary = fmtSalary(job.salaryMin, job.salaryMax);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-xl shadow-soft transition hover:border-brand-300 hover:shadow-glow dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-400/40"
    >
      <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-300/0 blur-2xl transition-all duration-500 group-hover:bg-brand-300/30 dark:group-hover:bg-brand-500/25" />

      <div className="relative flex items-start gap-3">
        <CompanyLogo name={job.company} size={48} />
        <div className="min-w-0 flex-1">
          <Link to={`/jobs/${job._id}`} className="block truncate font-display text-base font-bold text-strong group-hover:text-brand-700 dark:group-hover:text-brand-200">
            {job.title}
          </Link>
          <p className="truncate text-sm text-muted">{job.company}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {job.location}
          </p>
        </div>
        {onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(job._id); }}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              saved
                ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300'
                : 'text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-white/10'
            }`}
            aria-label={saved ? 'Unsave job' : 'Save job'}
            title={saved ? 'Unsave' : 'Save job'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700 dark:bg-white/10 dark:text-slate-200">
          {job.type}
        </span>
        {salary && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            {salary}
          </span>
        )}
        {job.skills?.slice(0, 2).map((s) => (
          <span key={s} className="badge-brand">{s}</span>
        ))}
        {job.skills?.length > 2 && <span className="badge">+{job.skills.length - 2}</span>}
      </div>

      <p className="relative line-clamp-2 text-sm text-muted">{job.description}</p>

      <div className="relative mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
        <span className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(job.createdAt)}</span>
        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-glow"
        >
          Apply Now
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.article>
  );
}
