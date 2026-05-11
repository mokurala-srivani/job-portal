import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../components/Logo.jsx';
import { AuthShell, IconInput } from './Login.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Enter your email');
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSent(true);
    toast.success('If that email exists, a reset link is on the way');
  };

  return (
    <AuthShell variant="forgot">
      <div className="flex items-center justify-between">
        <Logo />
        <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Back to login
        </Link>
      </div>

      <div className="mt-16 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-slate-900">Forgot Password?</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {sent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-8 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1 text-emerald-700/80">
            If <span className="font-medium">{email}</span> matches an account, you'll get a reset link shortly.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="label">Email Address</label>
            <IconInput icon="mail" type="email" autoFocus required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button className="btn-primary w-full py-3 text-sm" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to login</Link>
      </p>
    </AuthShell>
  );
}
