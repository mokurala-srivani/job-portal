const TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function Filters({ value, onChange, onReset }) {
  const set = (patch) => onChange({ ...value, ...patch, page: 1 });
  return (
    <aside className="card space-y-4 p-4">
      <div>
        <label className="label">Location</label>
        <input
          className="input"
          placeholder="e.g. Remote, Bangalore"
          value={value.location || ''}
          onChange={(e) => set({ location: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Job type</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = value.type === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => set({ type: active ? '' : t })}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="label">Skills (comma separated)</label>
        <input
          className="input"
          placeholder="React, Node.js"
          value={value.skills || ''}
          onChange={(e) => set({ skills: e.target.value })}
        />
      </div>
      <button className="btn-secondary w-full" onClick={onReset}>Reset filters</button>
    </aside>
  );
}
