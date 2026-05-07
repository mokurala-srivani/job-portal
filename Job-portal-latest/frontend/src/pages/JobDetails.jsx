import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getJob, deleteJob, toggleSavedJob, savedJobs as fetchSaved } from '../services/jobs';
import { apply, myApplications } from '../services/applications';
import { useAuth } from '../context/AuthContext.jsx';
import CompanyLogo from '../components/CompanyLogo.jsx';

const fmtSalary = (min, max) => {
  if (!min && !max) return null;
  const f = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : n);
  if (min && max) return `$${f(min)} – $${f(max)}`;
  return `$${f(min || max)}+`;
};

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getJob(id)
      .then((j) => { if (!cancelled) setJob(j); })
      .catch((e) => { if (!cancelled) setError(e.response?.data?.message || 'Job not found'); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (user?.role !== 'job_seeker') return;
    fetchSaved().then(({ items }) => setSaved(items.some((j) => j._id === id))).catch(() => {});
    myApplications().then(({ items }) => {
      setHasApplied(items.some((a) => a.job?._id === id || a.job === id));
    }).catch(() => {});
  }, [id, user]);

  const onApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!resume) return toast.error('Please attach a resume');
    setSubmitting(true);
    try {
      await apply({ jobId: id, resume, coverLetter });
      toast.success('Application submitted!');
      setResume(null);
      setCoverLetter('');
      setHasApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete');
    }
  };

  const onSave = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'job_seeker') return;
    try {
      await toggleSavedJob(id);
      setSaved((s) => !s);
    } catch {
      toast.error('Could not update saved jobs');
    }
  };

  if (error) {
    return (
      <div className="section py-16 text-center">
        <p className="text-slate-600">{error}</p>
        <Link to="/jobs" className="btn-primary mt-4 inline-flex">Back to jobs</Link>
      </div>
    );
  }
  if (!job) return <div className="section py-16 text-center text-slate-500">Loading…</div>;

  const isOwner = user && (user.role === 'admin' || job.postedBy?._id === user._id || job.postedBy === user._id);
  const canApply = user?.role === 'job_seeker';
  const salary = fmtSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="bg-slate-50">
      <div className="bg-white">
        <div className="section py-6">
          <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to jobs
          </Link>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <CompanyLogo name={job.company} size={72} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-slate-600">{job.company}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="capitalize">{job.type}</span>
                  {salary && (<><span className="text-slate-300">·</span><span>{salary}</span></>)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canApply && (
                <button onClick={onSave} className={`btn-secondary ${saved ? 'border-amber-300 text-amber-600' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3 7h7l-5.5 4 2 8L12 17l-6.5 4 2-8L2 9h7z" />
                  </svg>
                  {saved ? 'Saved' : 'Save job'}
                </button>
              )}
              {canApply && (
                hasApplied
                  ? <span className="badge bg-emerald-100 text-emerald-800">✓ Applied</span>
                  : <a href="#apply" className="btn-primary">Apply now</a>
              )}
              {isOwner && (
                <button className="btn-secondary text-rose-600" onClick={onDelete}>Delete</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <article className="card p-8">
          {job.skills?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {job.skills.map((s) => <span key={s} className="badge-brand">{s}</span>)}
            </div>
          )}
          <h2 className="mb-3 text-lg font-semibold text-slate-900">About the role</h2>
          <div className="prose prose-slate max-w-none whitespace-pre-line text-slate-700">{job.description}</div>

          {canApply && hasApplied && (
            <div id="apply" className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
              <p className="font-semibold">You've already applied to this role.</p>
              <p className="mt-1 text-sm text-emerald-700">Track its status from your <Link to="/dashboard?tab=applied" className="underline">Applications</Link> page.</p>
            </div>
          )}
          {canApply && !hasApplied && (
            <form id="apply" onSubmit={onApply} className="mt-10 space-y-4 border-t border-slate-100 pt-8">
              <div>
                <h2 className="text-lg font-semibold">Apply for this role</h2>
                <p className="text-sm text-slate-600">Submit your resume — we’ll forward it to {job.company}.</p>
              </div>
              <div>
                <label className="label">Resume (PDF/DOC/DOCX)</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-sm transition hover:border-brand-400 hover:bg-brand-50/50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
                  </svg>
                  <span className="font-medium text-slate-700">{resume ? resume.name : 'Click to upload your resume'}</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                    onChange={(e) => setResume(e.target.files?.[0] || null)} required />
                </label>
              </div>
              <div>
                <label className="label">Cover letter (optional)</label>
                <textarea className="input min-h-[140px]" value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a great fit for this role?" />
              </div>
              <button className="btn-primary w-full sm:w-auto" disabled={submitting} type="submit">
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}

          {!user && (
            <div className="mt-10 rounded-xl border border-brand-200 bg-brand-50 p-6 text-center">
              <p className="font-medium text-slate-800">Sign in as a job seeker to apply.</p>
              <Link to="/login" className="btn-primary mt-3 inline-flex">Sign in to apply</Link>
            </div>
          )}
        </article>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">About {job.company}</h3>
            <div className="flex items-center gap-3">
              <CompanyLogo name={job.company} size={48} />
              <div>
                <p className="font-semibold text-slate-900">{job.company}</p>
                <p className="text-xs text-slate-500">{job.location}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Quick facts</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="font-medium capitalize">{job.type}</dd></div>
              {salary && <div className="flex justify-between"><dt className="text-slate-500">Salary</dt><dd className="font-medium">{salary}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Location</dt><dd className="font-medium">{job.location}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Posted</dt><dd className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
