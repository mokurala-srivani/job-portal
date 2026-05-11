import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { listJobs, savedJobs, toggleSavedJob, myPostedJobs } from '../services/jobs';
import { myApplications, applicantsForJob } from '../services/applications';
import Logo from '../components/Logo.jsx';
import CompanyLogo from '../components/CompanyLogo.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ListSkeleton } from '../components/Skeleton.jsx';
import RecruiterDashboard from './RecruiterDashboard.jsx';

const CATEGORIES = [
  { name: 'UI/UX Design',     icon: 'design', q: 'designer',  count: '1,245 jobs', tint: 'bg-violet-100 text-violet-600' },
  { name: 'Development',      icon: 'code',   q: 'engineer',  count: '3,678 jobs', tint: 'bg-sky-100 text-sky-600' },
  { name: 'Marketing',        icon: 'mega',   q: 'marketing', count: '1,096 jobs', tint: 'bg-emerald-100 text-emerald-600' },
  { name: 'Sales',            icon: 'thumb',  q: 'sales',     count: '1,192 jobs', tint: 'bg-amber-100 text-amber-600' },
  { name: 'Product',          icon: 'box',    q: 'product',   count: '1,005 jobs', tint: 'bg-rose-100 text-rose-600' },
  { name: 'Customer Support', icon: 'chat',   q: 'support',   count: '876 jobs',   tint: 'bg-teal-100 text-teal-600' },
];

const SEEKER_NAV = [
  { to: '/dashboard',                     label: 'Home',         icon: 'home',     end: true },
  { to: '/jobs',                          label: 'Find Jobs',    icon: 'search' },
  { to: '/dashboard?tab=saved',           label: 'Saved Jobs',   icon: 'bookmark' },
  { to: '/dashboard?tab=applied',         label: 'Applications', icon: 'doc' },
];

const RECRUITER_NAV = [
  { to: '/dashboard',                 label: 'Dashboard',     icon: 'home',  end: true },
  { to: '/dashboard?tab=postings',    label: 'My Job Posts',  icon: 'doc' },
  { to: '/dashboard?tab=create',      label: 'Post a Job',    icon: 'plus' },
  { to: '/dashboard?tab=applicants',  label: 'Applicants',    icon: 'users' },
  { to: '/jobs',                      label: 'Browse Jobs',   icon: 'search' },
];

const STATUS_COLORS = {
  pending:     'bg-amber-100 text-amber-800',
  reviewed:    'bg-blue-100 text-blue-800',
  shortlisted: 'bg-emerald-100 text-emerald-800',
  rejected:    'bg-rose-100 text-rose-800',
  hired:       'bg-violet-100 text-violet-800',
};

const RECOMMENDED = [
  { title: 'UX Designer',        company: 'Airbnb',    location: 'Remote',       salary: '$85K – $105K', tint: 'bg-rose-100 text-rose-600' },
  { title: 'Software Engineer',  company: 'Microsoft', location: 'Redmond, WA',  salary: '$110K – $150K', tint: 'bg-sky-100 text-sky-600' },
  { title: 'Marketing Manager',  company: 'HubSpot',   location: 'Boston, MA',   salary: '$70K – $90K',   tint: 'bg-orange-100 text-orange-600' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const isSeeker = user.role === 'job_seeker';
  const nav = isSeeker ? SEEKER_NAV : RECRUITER_NAV;

  return (
    <DashboardShell user={user} nav={nav} onLogout={() => { logout(); navigate('/'); }} isSeeker={isSeeker}>
      {isSeeker ? <SeekerHome user={user} /> : <RecruiterHome user={user} />}
    </DashboardShell>
  );
}

function DashboardShell({ user, nav, onLogout, isSeeker, children }) {
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (loc) params.set('location', loc);
    navigate(`/jobs${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-[1500px]">
        {/* SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white py-6 lg:flex">
          <div className="px-6"><Logo /></div>

          <nav className="mt-8 flex-1 space-y-1 overflow-y-auto px-3">
            {nav.map((n) => <NavItem key={n.label} item={n} />)}
          </nav>

          <div className="mx-3 mt-3">
            <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <SideIcon name="logout" />
              Log Out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* TOP BAR */}
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMenuOpen((o) => !o)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden" aria-label="Menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>

              <form onSubmit={onSearch} className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                  <input className="w-full bg-transparent py-2 text-sm focus:outline-none"
                    placeholder="Search jobs, companies, or keywords" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <div className="hidden h-6 w-px bg-slate-200 sm:block" />
                <div className="hidden flex-1 items-center gap-2 px-3 sm:flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>
                  <input className="w-full bg-transparent py-2 text-sm focus:outline-none"
                    placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} />
                </div>
                <button className="btn-primary px-6 py-2 text-sm" type="submit">Search</button>
              </form>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>

            {menuOpen && (
              <nav className="mt-3 grid gap-1 border-t border-slate-200 pt-3 lg:hidden">
                {nav.map((n) => <NavItem key={n.label} item={n} onClick={() => setMenuOpen(false)} />)}
                <button onClick={onLogout} className="mt-1 rounded-lg border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700">
                  Log Out
                </button>
              </nav>
            )}
          </div>

          <div className="px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, onClick }) {
  const cls = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;
  return (
    <NavLink to={item.to} end={item.end} onClick={onClick} className={cls}>
      <SideIcon name={item.icon} />
      <span className="flex-1">{item.label}</span>
    </NavLink>
  );
}

function SeekerHome({ user }) {
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'overview';

  const [featured, setFeatured] = useState(null);
  const [apps, setApps] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    listJobs({ limit: 3 }).then((d) => setFeatured(d.items || [])).catch(() => setFeatured([]));
    myApplications().then(({ items }) => setApps(items || [])).catch(() => setApps([]));
    savedJobs().then(({ items }) => setSaved(items || [])).catch(() => setSaved([]));
  }, []);

  const savedIds = useMemo(() => new Set((saved || []).map((j) => j._id)), [saved]);

  const onToggleSave = useCallback(async (jobId) => {
    try {
      await toggleSavedJob(jobId);
      const fresh = await savedJobs();
      setSaved(fresh.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save job');
    }
  }, []);

  if (tab === 'applied') return <ApplicationsView apps={apps} />;
  if (tab === 'saved')   return <SavedView saved={saved} onToggleSave={onToggleSave} />;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-white to-indigo-50 p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_240px]">
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Find the job
                <br />
                that fits <span className="text-gradient">your life</span>
              </h1>
              <p className="mt-3 max-w-md text-sm text-slate-600">
                Discover opportunities, showcase your skills, and build the career you've always wanted.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/jobs" className="btn-primary px-6 py-2.5 text-sm">Find Jobs</Link>
                <Link to="/dashboard?tab=applied" className="btn border-2 border-brand-600 bg-transparent px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  Upload Resume
                </Link>
              </div>
            </div>
            <div className="hidden lg:block"><ChairArt /></div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Popular Categories</h2>
            <Link to="/jobs" className="text-xs font-medium text-brand-700 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {CATEGORIES.map((c) => (
              <Link key={c.name} to={`/jobs?q=${encodeURIComponent(c.q)}`}
                className="card flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c.tint}`}><CatIcon name={c.icon} /></span>
                <span className="text-[11px] font-semibold text-slate-800">{c.name}</span>
                <span className="text-[10px] text-slate-500">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED JOBS */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Featured Jobs</h2>
            <Link to="/jobs" className="text-xs font-medium text-brand-700 hover:underline">View all</Link>
          </div>
          <ul className="space-y-3">
            {featured === null && <ListSkeleton count={3} />}
            {featured?.length === 0 && <EmptyState title="No jobs yet" message="Check back soon — new roles are posted daily." />}
            {featured?.map((j) => (
              <FeaturedRow key={j._id} job={j} saved={savedIds.has(j._id)} onSave={() => onToggleSave(j._id)} />
            ))}
          </ul>
          <div className="mt-4 flex justify-center">
            <Link to="/jobs" className="btn-secondary px-6 py-2 text-xs">View all jobs</Link>
          </div>
        </section>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="space-y-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-900">Recommended for you</h3>
          <ul className="mt-4 space-y-4">
            {RECOMMENDED.map((r) => (
              <li key={r.title} className="flex items-start gap-3">
                <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-sm font-bold ${r.tint}`}>{r.company[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="truncate text-xs text-slate-500">{r.company}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>
                    {r.location}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-600">{r.salary}</p>
                </div>
                <button type="button" aria-label="Save"
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-rose-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </aside>
    </div>
  );
}

function ApplicationsView({ apps }) {
  if (apps === null) return <ListSkeleton count={4} />;
  if (apps.length === 0)
    return <EmptyState title="No applications yet" message="Browse open roles and apply with one click." action={<Link className="btn-primary mt-3" to="/jobs">Browse jobs</Link>} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
      <p className="mt-1 text-sm text-slate-600">{apps.length} total</p>
      <ul className="mt-6 space-y-3">
        {apps.map((a) => (
          <li key={a._id} className="card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <Link to={`/jobs/${a.job?._id}`} className="font-semibold text-slate-900 hover:text-brand-700">
                {a.job?.title || 'Job removed'}
              </Link>
              <p className="text-sm text-slate-600">{a.job?.company} · {a.job?.location}</p>
              <p className="mt-1 text-xs text-slate-500">Applied {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`badge capitalize ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SavedView({ saved, onToggleSave }) {
  if (saved === null) return <ListSkeleton count={3} />;
  if (saved.length === 0)
    return <EmptyState title="No saved jobs" message="Tap the bookmark on any job to save it for later." action={<Link className="btn-primary mt-3" to="/jobs">Browse jobs</Link>} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
      <p className="mt-1 text-sm text-slate-600">{saved.length} saved</p>
      <ul className="mt-6 space-y-3">
        {saved.map((j) => (
          <FeaturedRow key={j._id} job={j} saved onSave={() => onToggleSave(j._id)} />
        ))}
      </ul>
    </div>
  );
}

function FeaturedRow({ job, saved, onSave }) {
  const salary = useMemo(() => {
    const f = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);
    if (job.salaryMin && job.salaryMax) return `${f(job.salaryMin)} - ${f(job.salaryMax)}`;
    if (job.salaryMin || job.salaryMax) return `${f(job.salaryMin || job.salaryMax)}+`;
    return null;
  }, [job]);

  const ago = useMemo(() => {
    if (!job.createdAt) return '';
    const ms = Date.now() - new Date(job.createdAt).getTime();
    const h = Math.floor(ms / 36e5);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }, [job.createdAt]);

  return (
    <li className="card flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
      <CompanyLogo name={job.company} size={48} />
      <div className="min-w-0 flex-1">
        <Link to={`/jobs/${job._id}`} className="block truncate font-semibold text-slate-900 hover:text-brand-700">{job.title}</Link>
        <p className="truncate text-sm text-slate-600">
          {job.company} <span className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 text-[8px] text-white">✓</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>
            {job.location || 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {job.type || 'Full-time'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 self-stretch sm:self-auto">
        {salary && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{salary}</span>}
        <span className="hidden text-xs text-slate-500 sm:inline">{ago}</span>
        {onSave && (
          <button type="button" onClick={(e) => { e.preventDefault(); onSave(); }}
            className={`grid h-9 w-9 place-items-center rounded-lg border transition ${
              saved ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-400 hover:text-rose-500'
            }`} aria-label={saved ? 'Unsave' : 'Save'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </button>
        )}
        <Link to={`/jobs/${job._id}`} className="btn-primary px-5 py-2 text-xs">Apply Now</Link>
      </div>
    </li>
  );
}

/* ---------------- RECRUITER ---------------- */

function RecruiterHome({ user }) {
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'overview';

  const [jobs, setJobs] = useState(null);
  const [applicants, setApplicants] = useState(null);

  useEffect(() => {
    let active = true;
    myPostedJobs().then(({ items }) => active && setJobs(items || [])).catch(() => active && setJobs([]));
    return () => { active = false; };
  }, []);

  // Aggregate recent applicants across all postings (best-effort).
  useEffect(() => {
    if (!jobs || jobs.length === 0) { setApplicants([]); return; }
    let active = true;
    Promise.all(jobs.slice(0, 5).map((j) =>
      applicantsForJob(j._id).then(({ items }) => (items || []).map((a) => ({ ...a, _job: j }))).catch(() => [])
    )).then((rows) => {
      if (!active) return;
      const flat = rows.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setApplicants(flat);
    });
    return () => { active = false; };
  }, [jobs]);

  const stats = useMemo(() => {
    const list = applicants || [];
    return {
      active: jobs?.length ?? 0,
      total: list.length,
      pending: list.filter((a) => a.status === 'pending' || a.status === 'reviewed').length,
      hired: list.filter((a) => a.status === 'hired').length,
    };
  }, [jobs, applicants]);

  if (tab === 'create' || tab === 'postings' || tab === 'applicants') {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/dashboard" className="hover:text-brand-700">Dashboard</Link>
          <span>›</span>
          <span className="capitalize text-slate-700">{tab === 'create' ? 'Post a Job' : tab === 'postings' ? 'My Job Posts' : 'Applicants'}</span>
        </div>
        <RecruiterDashboard />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* HERO — distinct amber/orange gradient so recruiters never see seeker copy */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_220px]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Recruiter Workspace
              </span>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Hire the talent
                <br />
                that <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">fits your team</span>
              </h1>
              <p className="mt-3 max-w-md text-sm text-slate-600">
                Welcome back, {user.name?.split(' ')[0] || 'there'}. Manage postings, review applicants, and hire faster.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/dashboard?tab=create" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:from-amber-600 hover:to-orange-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  Post a New Job
                </Link>
                <Link to="/dashboard?tab=applicants" className="btn border-2 border-amber-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                  Review Applicants
                </Link>
              </div>
            </div>
            <div className="hidden lg:block"><RecruiterArt /></div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <RecruiterStat label="Active Postings"  value={stats.active}  icon="doc"   tint="bg-amber-100 text-amber-700" />
          <RecruiterStat label="Total Applicants" value={stats.total}   icon="users" tint="bg-blue-100 text-blue-700" />
          <RecruiterStat label="Pending Review"   value={stats.pending} icon="clock" tint="bg-rose-100 text-rose-700" />
          <RecruiterStat label="Hired"            value={stats.hired}   icon="check" tint="bg-emerald-100 text-emerald-700" />
        </section>

        {/* RECENT POSTINGS */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Your Recent Postings</h2>
            <Link to="/dashboard?tab=postings" className="text-xs font-medium text-amber-700 hover:underline">View all</Link>
          </div>
          {jobs === null ? <ListSkeleton count={2} /> : jobs.length === 0 ? (
            <EmptyState
              title="No postings yet"
              message="Post your first opening — it takes about a minute."
              action={<Link className="btn-primary mt-3" to="/dashboard?tab=create">Post a Job</Link>}
            />
          ) : (
            <ul className="space-y-3">
              {jobs.slice(0, 3).map((j) => (
                <li key={j._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link to={`/jobs/${j._id}`} className="block truncate font-semibold text-slate-900 hover:text-amber-700">{j.title}</Link>
                    <p className="truncate text-sm text-slate-600">{j.company} · {j.location}</p>
                    <p className="mt-1 text-xs text-slate-500">Posted {new Date(j.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 capitalize">{j.type}</span>
                    <Link to="/dashboard?tab=postings" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Manage</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* RIGHT — RECENT APPLICANTS */}
      <aside className="space-y-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Applicants</h3>
            <Link to="/dashboard?tab=applicants" className="text-xs font-medium text-amber-700 hover:underline">View all</Link>
          </div>
          {applicants === null ? (
            <p className="mt-4 text-xs text-slate-500">Loading…</p>
          ) : applicants.length === 0 ? (
            <p className="mt-4 text-xs text-slate-500">Applicants will show up here once people apply.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {applicants.slice(0, 5).map((a) => (
                <li key={a._id} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                    {a.applicant?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{a.applicant?.name || 'Applicant'}</p>
                    <p className="truncate text-xs text-slate-500">applied to {a._job?.title}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
          <h3 className="font-display text-base font-bold text-amber-800">Hiring tip</h3>
          <p className="mt-1 text-xs text-slate-700">
            Postings with a clear salary range get <span className="font-semibold">2.3×</span> more qualified applicants.
          </p>
          <Link to="/dashboard?tab=create" className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700">
            Post a Job
          </Link>
        </div>
      </aside>
    </div>
  );
}

function RecruiterStat({ label, value, icon, tint }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><StatIcon name={icon} /></span>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function StatIcon({ name }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'doc':   return <svg {...p}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6" /></svg>;
    case 'users': return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'check': return <svg {...p}><path d="M5 12l5 5L20 7" /></svg>;
    default: return null;
  }
}

function RecruiterArt() {
  return (
    <svg viewBox="0 0 240 220" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="rec-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* document with We're Hiring */}
      <rect x="40" y="40" width="120" height="160" rx="14" fill="url(#rec-bg)" />
      <rect x="55" y="56" width="90" height="10" rx="5" fill="#fff" opacity="0.9" />
      <rect x="55" y="74" width="70" height="6" rx="3" fill="#fff" opacity="0.7" />
      <rect x="55" y="86" width="80" height="6" rx="3" fill="#fff" opacity="0.7" />
      <rect x="55" y="106" width="90" height="50" rx="6" fill="#fff" opacity="0.95" />
      <text x="100" y="128" textAnchor="middle" fontSize="13" fontWeight="800" fill="#ea580c">We're</text>
      <text x="100" y="145" textAnchor="middle" fontSize="13" fontWeight="800" fill="#ea580c">Hiring!</text>
      {/* magnifier */}
      <circle cx="180" cy="120" r="22" fill="none" stroke="#1e293b" strokeWidth="6" />
      <path d="M196 136 l16 18" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="180" cy="120" r="22" fill="#fde68a" opacity="0.4" />
      {/* tiny avatar floats */}
      <circle cx="40" cy="30" r="14" fill="#7c5cff" />
      <text x="40" y="35" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">A</text>
      <circle cx="200" cy="40" r="12" fill="#10b981" />
      <text x="200" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">B</text>
    </svg>
  );
}

function ChairArt() {
  return (
    <svg viewBox="0 0 280 240" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="dh-chair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5a2be0" />
        </linearGradient>
      </defs>
      {/* tag */}
      <g transform="translate(180 30) rotate(15)">
        <rect width="60" height="40" rx="6" fill="#fff" />
        <text x="30" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7c5cff">We're</text>
        <text x="30" y="32" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7c5cff">Hiring</text>
      </g>
      {/* chair back */}
      <rect x="60" y="40" width="160" height="120" rx="20" fill="url(#dh-chair)" />
      {/* armrest line */}
      <rect x="60" y="150" width="160" height="14" rx="6" fill="#5b3df5" />
      {/* base */}
      <path d="M120 164 L160 164 L155 200 L125 200 Z" fill="#475569" />
      <ellipse cx="140" cy="210" rx="50" ry="6" fill="#1e293b" />
    </svg>
  );
}

function CatIcon({ name }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'design': return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'code':   return <svg {...p}><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></svg>;
    case 'mega':   return <svg {...p}><path d="M3 11v2a2 2 0 002 2h2l5 4V5L7 9H5a2 2 0 00-2 2zM18 8a5 5 0 010 8" /></svg>;
    case 'thumb':  return <svg {...p}><path d="M14 9V5a3 3 0 00-6 0v4H5a2 2 0 00-2 2v8a2 2 0 002 2h12l4-8a2 2 0 00-2-3z" /></svg>;
    case 'box':    return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M3 11h18M8 7V5a2 2 0 014 0v2" /></svg>;
    case 'chat':   return <svg {...p}><path d="M21 12a8 8 0 11-3-6.2L21 4v6h-6" /></svg>;
    default: return null;
  }
}

function SideIcon({ name }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':     return <svg {...p}><path d="M3 12l9-9 9 9M5 10v10h14V10" /></svg>;
    case 'search':   return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>;
    case 'building': return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 21V11h6v10M9 7h.01M15 7h.01M9 11h.01M15 11h.01" /></svg>;
    case 'bookmark': return <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
    case 'doc':      return <svg {...p}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6M9 13h6M9 17h6" /></svg>;
    case 'chat':     return <svg {...p}><path d="M21 12a8 8 0 01-12 7L4 21l1.5-4.5A8 8 0 1121 12z" /></svg>;
    case 'bell':     return <svg {...p}><path d="M18 16v-5a6 6 0 10-12 0v5l-2 3h16zM10 22a2 2 0 004 0" /></svg>;
    case 'edit':     return <svg {...p}><path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4z" /></svg>;
    case 'book':     return <svg {...p}><path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" /></svg>;
    case 'cog':      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>;
    case 'logout':   return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
    case 'plus':     return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'users':    return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'chart':    return <svg {...p}><path d="M3 3v18h18M7 14l4-4 4 4 5-5" /></svg>;
    default: return null;
  }
}