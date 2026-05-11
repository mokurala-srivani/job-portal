import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide top navbar on dashboard (it has its own top bar). Must come AFTER hooks.
  if (location.pathname.startsWith('/dashboard')) return null;

  const onLogout = () => { logout(); navigate('/'); };

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'text-brand-700'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/40 bg-white/70 backdrop-blur-2xl'
          : 'border-b border-transparent bg-white/40 backdrop-blur-xl'
      }`}
    >
      <div className="section flex items-center justify-between py-3">
        <Link to="/" onClick={() => setOpen(false)} className="transition hover:opacity-90">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/jobs" className={linkClass}>Find Jobs</NavLink>
          {user && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">

          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 backdrop-blur">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-glow">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>
              <button className="btn-secondary" onClick={onLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Log in</Link>
              <Link to="/register" className="btn-primary px-5">Sign up</Link>
            </>
          )}
        </div>


      </div>

      {open && (
        <div className="border-t border-slate-200/70 bg-white/90 backdrop-blur-xl md:hidden">
          <div className="section flex flex-col gap-1 py-3">
            <NavLink to="/jobs" onClick={() => setOpen(false)} className={linkClass}>Browse jobs</NavLink>
            {user && <NavLink to="/dashboard" onClick={() => setOpen(false)} className={linkClass}>Dashboard</NavLink>}
            <div className="mt-2 flex gap-2">
              {user ? (
                <button className="btn-secondary flex-1" onClick={() => { setOpen(false); onLogout(); }}>Sign out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1">Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
