export default function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">∅</div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {message && <p className="max-w-md text-sm text-slate-600">{message}</p>}
      {action}
    </div>
  );
}
