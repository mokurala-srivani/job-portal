import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { myPostedJobs, createJob, deleteJob } from '../services/jobs';
import { applicantsForJob, updateApplicationStatus } from '../services/applications';
import EmptyState from '../components/EmptyState.jsx';
import { fileBase } from '../services/api';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

const empty = {
  title: '', company: '', location: '', description: '',
  type: 'full-time', salaryMin: '', salaryMax: '', skills: '',
};

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState(null);
  const [form, setForm] = useState(empty);
  const [creating, setCreating] = useState(false);
  const [openJob, setOpenJob] = useState(null);
  const [applicants, setApplicants] = useState(null);

  const refresh = () => myPostedJobs().then(({ items }) => setJobs(items)).catch(() => setJobs([]));
  useEffect(() => { refresh(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createJob({
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        type: form.type,
        ...(form.salaryMin ? { salaryMin: Number(form.salaryMin) } : {}),
        ...(form.salaryMax ? { salaryMax: Number(form.salaryMax) } : {}),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Job posted');
      setForm(empty);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create job');
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      toast.success('Job deleted');
      if (openJob?._id === id) setOpenJob(null);
      refresh();
    } catch {
      toast.error('Could not delete');
    }
  };

  const openApplicants = async (job) => {
    setOpenJob(job);
    setApplicants(null);
    try {
      const { items } = await applicantsForJob(job._id);
      setApplicants(items);
    } catch {
      setApplicants([]);
      toast.error('Could not load applicants');
    }
  };

  const setStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setApplicants((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
    } catch {
      toast.error('Could not update status');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Your postings</h2>
        {jobs === null ? (
          <p className="text-slate-500">Loading…</p>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs yet" message="Post your first opening using the form on the right." />
        ) : (
          <ul className="space-y-3">
            {jobs.map((j) => (
              <li key={j._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-slate-900">{j.title}</h3>
                    <p className="text-sm text-slate-600">{j.company} · {j.location}</p>
                    <p className="mt-1 text-xs text-slate-500">Posted {new Date(j.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button className="btn-secondary" onClick={() => openApplicants(j)}>View applicants</button>
                    <button className="btn-ghost text-rose-600 hover:bg-rose-50" onClick={() => onDelete(j._id)}>Delete</button>
                  </div>
                </div>

                {openJob?._id === j._id && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="mb-2 text-sm font-semibold">Applicants</h4>
                    {applicants === null ? (
                      <p className="text-sm text-slate-500">Loading…</p>
                    ) : applicants.length === 0 ? (
                      <p className="text-sm text-slate-500">No applicants yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {applicants.map((a) => (
                          <li key={a._id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{a.applicant?.name}</p>
                              <p className="text-xs text-slate-600">{a.applicant?.email}</p>
                              <a href={`${fileBase}${a.resumeUrl}`} target="_blank" rel="noreferrer"
                                 className="text-sm text-brand-700 hover:underline">View resume</a>
                            </div>
                            <select
                              className="input sm:w-44"
                              value={a.status}
                              onChange={(e) => setStatus(a._id, e.target.value)}
                            >
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside>
        <form onSubmit={onCreate} className="card space-y-3 p-4">
          <h2 className="text-lg font-semibold">Post a new job</h2>
          <div>
            <label className="label">Title</label>
            <input className="input" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" required value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" required value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Salary min</label>
              <input className="input" type="number" min="0" value={form.salaryMin}
                onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            </div>
            <div>
              <label className="label">Salary max</label>
              <input className="input" type="number" min="0" value={form.salaryMax}
                onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Skills (comma separated)</label>
            <input className="input" value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="React, Node.js" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[120px]" required minLength={20} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn-primary w-full" type="submit" disabled={creating}>
            {creating ? 'Posting…' : 'Post job'}
          </button>
        </form>
      </aside>
    </div>
  );
}
