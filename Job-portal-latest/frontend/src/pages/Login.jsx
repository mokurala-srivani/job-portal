import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const fill = (email) => setForm({ email, password: 'password123' });

  return (
    <AuthShell variant="login">
      <div className="flex items-center justify-between">
        <Logo />
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">Sign up</Link>
        </p>
      </div>

      <div className="mt-12">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Welcome Back!</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to your account</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <IconInput
            icon="mail"
            type="email"
            placeholder="Email Address"
            required
            autoFocus
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <IconInput
            icon="lock"
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            trailing={
              <button type="button" onClick={() => setShowPw((s) => !s)} className="text-slate-400 hover:text-slate-600" aria-label="Toggle password">
                <EyeIcon hidden={!showPw} />
              </button>
            }
          />
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-brand-700 hover:underline">Forgot password?</Link>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-3 text-sm" disabled={submitting} type="submit">
            {submitting ? 'Signing in…' : 'Log In'}
          </motion.button>
        </form>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-xs text-slate-600">
          <p className="mb-2 font-medium text-slate-700">Try a demo account:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              ['Recruiter', 'recruiter@example.com'],
              ['Seeker', 'seeker@example.com'],
              ['Admin', 'admin@example.com'],
            ].map(([label, email]) => (
              <button key={email} type="button" onClick={() => fill(email)} className="chip">{label}</button>
            ))}
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

/* ---------------- Shared shells & widgets (also used by Register / ForgotPassword) ---------------- */

export function AuthShell({ children, variant = 'login' }) {
  const headlines = {
    login:    { title: 'Welcome back', sub: 'Log in to access your dashboard\nand find new opportunities.' },
    register: { title: 'Your dream job\nis waiting',     sub: 'Join thousands of professionals\nfinding their perfect job match\nevery day.' },
    forgot:   { title: 'Reset your password',            sub: 'Enter the email tied to your\naccount and we\'ll send a secure\nreset link.' },
  }[variant];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 px-4 py-10">
      <div className="blob -left-24 top-12 h-80 w-80 bg-brand-300/20" />
      <div className="blob -right-24 bottom-10 h-80 w-80 bg-indigo-300/20" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glass lg:grid-cols-[1fr_1.1fr]"
      >
        <AuthIllustration variant={variant} headline={headlines.title} sub={headlines.sub} />
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthIllustration({ variant, headline, sub }) {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 p-10 lg:block">
      <div className="absolute inset-0 bg-grid-slate [background-size:24px_24px] opacity-20" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative flex h-full flex-col text-white">
        <div className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight whitespace-pre-line">
          {headline}
        </div>
        <p className="mt-4 max-w-xs text-sm text-white/85 whitespace-pre-line">{sub}</p>

        {variant === 'register' && (
          <ul className="mt-6 space-y-2.5 text-sm">
            {['Access thousands of jobs', 'Apply with one click', 'Get noticed by top companies'].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-white/95">{t}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex justify-center pt-8">
          {variant === 'forgot' ? <PaperPlaneArt /> : <BriefcaseArt locked={variant === 'login'} />}
        </div>
      </div>
    </aside>
  );
}

export function IconInput({ icon, trailing, ...props }) {
  const icons = {
    mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
    lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>,
    user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>,
  };
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icons[icon]}</span>
      <input className="input pl-10 pr-10 py-3" {...props} />
      {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
}

export function EyeIcon({ hidden }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {hidden
        ? <><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a18.6 18.6 0 014.06-4.93M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 7 11 7a18.6 18.6 0 01-3.17 4.18M1 1l22 22" /><path d="M14.12 14.12a3 3 0 01-4.24-4.24" /></>
        : <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>
      }
    </svg>
  );
}

function BriefcaseArt({ locked }) {
  return (
    <svg viewBox="0 0 240 200" className="w-56 drop-shadow-2xl" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="120" cy="180" rx="80" ry="8" fill="rgba(0,0,0,0.18)" />
      {/* paper behind */}
      <rect x="155" y="40" width="60" height="80" rx="6" fill="#fff" opacity="0.95" />
      <rect x="165" y="58" width="40" height="4" rx="2" fill="#cbd5e1" />
      <rect x="165" y="68" width="32" height="4" rx="2" fill="#cbd5e1" />
      <rect x="165" y="78" width="36" height="4" rx="2" fill="#cbd5e1" />
      <circle cx="175" cy="100" r="6" fill="#7c5cff" />
      {/* plant */}
      <ellipse cx="220" cy="150" rx="14" ry="6" fill="#1e293b" />
      <path d="M220 150 q-10 -22 -2 -34 M220 150 q12 -16 6 -32 M220 150 q-4 -14 0 -28" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* briefcase */}
      <rect x="40" y="80" width="130" height="90" rx="10" fill="#5b3df5" />
      <rect x="40" y="80" width="130" height="14" rx="6" fill="#7c5cff" />
      <rect x="80" y="64" width="50" height="20" rx="4" fill="none" stroke="#5b3df5" strokeWidth="6" />
      {locked ? (
        <g transform="translate(95 110)">
          <rect width="20" height="22" rx="4" fill="#fff" />
          <path d="M5 10 V6 a5 5 0 0110 0 v4" fill="none" stroke="#fff" strokeWidth="3" />
        </g>
      ) : (
        <rect x="100" y="118" width="10" height="22" rx="2" fill="#fff" />
      )}
    </svg>
  );
}

function PaperPlaneArt() {
  return (
    <svg viewBox="0 0 240 200" className="w-60" aria-hidden="true">
      <ellipse cx="120" cy="180" rx="80" ry="6" fill="rgba(0,0,0,0.15)" />
      <path d="M30 110 q70 -50 180 -90 l-50 160 -50 -50 -80 -20z" fill="#fff" />
      <path d="M210 20 l-50 160 -50 -50z" fill="#cbd5e1" />
      <path d="M30 130 q40 -10 70 -50" stroke="#fff" strokeWidth="3" strokeDasharray="4 4" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M40 150 q50 -10 90 -50" stroke="#fff" strokeWidth="3" strokeDasharray="4 4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
