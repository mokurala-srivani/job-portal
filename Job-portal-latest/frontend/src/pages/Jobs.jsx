import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listJobs, toggleSavedJob, savedJobs as fetchSaved } from '../services/jobs';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext.jsx';
import JobCard from '../components/JobCard.jsx';
import Filters from '../components/Filters.jsx';
import { ListSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

const initialFromParams = (sp) => ({
  q: sp.get('q') || '',
  location: sp.get('location') || '',
  type: sp.get('type') || '',
  skills: sp.get('skills') || '',
  page: Number(sp.get('page') || 1),
});

export default function Jobs() {
  const [sp, setSp] = useSearchParams();
  const [filter, setFilter] = useState(() => initialFromParams(sp));
  const [data, setData] = useState({ items: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedSet, setSavedSet] = useState(new Set());
  const { user } = useAuth();

  const debouncedQ = useDebounce(filter.q, 350);
  const debouncedLoc = useDebounce(filter.location, 350);
  const debouncedSkills = useDebounce(filter.skills, 350);

  const queryParams = useMemo(
    () => ({
      ...(debouncedQ ? { q: debouncedQ } : {}),
      ...(debouncedLoc ? { location: debouncedLoc } : {}),
      ...(filter.type ? { type: filter.type } : {}),
      ...(debouncedSkills ? { skills: debouncedSkills } : {}),
      page: filter.page,
      limit: 12,
    }),
    [debouncedQ, debouncedLoc, filter.type, debouncedSkills, filter.page]
  );

  useEffect(() => {
    const next = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v && k !== 'limit') next.set(k, String(v));
    });
    setSp(next, { replace: true });
  }, [queryParams, setSp]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listJobs(queryParams)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e) => { if (!cancelled) setError(e.response?.data?.message || 'Failed to load jobs'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [queryParams]);

  useEffect(() => {
    if (user?.role !== 'job_seeker') return;
    fetchSaved()
      .then(({ items }) => setSavedSet(new Set(items.map((j) => j._id))))
      .catch(() => {});
  }, [user]);

  const onSave = async (jobId) => {
    if (!user) return toast.error('Please sign in to save jobs');
    if (user.role !== 'job_seeker') return;
    try {
      await toggleSavedJob(jobId);
      setSavedSet((prev) => {
        const next = new Set(prev);
        next.has(jobId) ? next.delete(jobId) : next.add(jobId);
        return next;
      });
    } catch {
      toast.error('Could not update saved jobs');
    }
  };

  const reset = () => setFilter({ q: '', location: '', type: '', skills: '', page: 1 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Browse jobs</h1>
        <input
          className="input sm:max-w-sm"
          value={filter.q}
          onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value, page: 1 }))}
          placeholder="Search title, company, skill…"
        />
      </header>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Filters value={filter} onChange={setFilter} onReset={reset} />
        <section>
          {loading ? (
            <ListSkeleton />
          ) : error ? (
            <EmptyState title="Something went wrong" message={error} />
          ) : data.items.length === 0 ? (
            <EmptyState title="No jobs match" message="Try removing filters or broadening your search." />
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-600">{data.total} result{data.total === 1 ? '' : 's'}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.items.map((j) => (
                  <JobCard key={j._id} job={j} onSave={onSave} saved={savedSet.has(j._id)} />
                ))}
              </div>
              {data.pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    className="btn-secondary"
                    disabled={filter.page <= 1}
                    onClick={() => setFilter((f) => ({ ...f, page: f.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">Page {data.page} of {data.pages}</span>
                  <button
                    className="btn-secondary"
                    disabled={filter.page >= data.pages}
                    onClick={() => setFilter((f) => ({ ...f, page: f.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
