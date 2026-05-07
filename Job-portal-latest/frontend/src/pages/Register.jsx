import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { AuthShell, IconInput, EyeIcon } from './Login.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'job_seeker' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Welcome to Jobify');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell variant="register">
      <div className="flex items-center justify-between">
        <Logo />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Log in</Link>
        </p>
      </div>

      <div className="mt-12">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign up to get started</p>

        <div className="mb-4 mt-6 grid grid-cols-2 gap-2">
          {[
            { v: 'job_seeker', label: 'Find a job', icon: '🎯' },
            { v: 'recruiter',  label: 'Hire talent', icon: '🚀' },
          ].map((opt) => (
            <button
              type="button"
              key={opt.v}
              onClick={() => setForm({ ...form, role: opt.v })}
              className={`rounded-xl border-2 p-3 text-left transition ${
                form.role === opt.v
                  ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10'
                  : 'border-slate-200 hover:border-slate-300 dark:border-white/10'
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <p className={`mt-0.5 text-xs font-semibold ${form.role === opt.v ? 'text-brand-700 dark:text-brand-200' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</p>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <IconInput icon="user"  placeholder="Full Name"     required value={form.name}     onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <IconInput icon="mail"  type="email" placeholder="Email Address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <IconInput
            icon="lock"
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            required minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            trailing={
              <button type="button" onClick={() => setShowPw((s) => !s)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Toggle password">
                <EyeIcon hidden={!showPw} />
              </button>
            }
          />

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-3 text-sm" disabled={submitting} type="submit">
            {submitting ? 'Creating account…' : 'Create Account'}
          </motion.button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          By creating an account, you agree to our{' '}
          <a href="#" className="font-semibold text-brand-700 dark:text-brand-300">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="font-semibold text-brand-700 dark:text-brand-300">Privacy Policy</a>
        </p>
      </div>
    </AuthShell>
  );
}
