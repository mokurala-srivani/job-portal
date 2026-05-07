import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="mt-2 text-slate-600">That page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
    </div>
  );
}
