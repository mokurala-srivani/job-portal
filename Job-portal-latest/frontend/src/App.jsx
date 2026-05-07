import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Logo from './components/Logo.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetails from './pages/JobDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/dashboard') ||
                     location.pathname.startsWith('/login') ||
                     location.pathname.startsWith('/register') ||
                     location.pathname.startsWith('/forgot-password');
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function Footer() {
  const cols = [
    {
      title: 'For seekers',
      links: [
        { label: 'Browse jobs', to: '/jobs' },
        { label: 'Remote roles', to: '/jobs?type=remote' },
        { label: 'Internships', to: '/jobs?type=internship' },
        { label: 'Sign in', to: '/login' },
      ],
    },
    {
      title: 'For recruiters',
      links: [
        { label: 'Post a job', to: '/register' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Pricing', to: '/' },
        { label: 'Resources', to: '/' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/' },
        { label: 'Blog', to: '/' },
        { label: 'Careers', to: '/' },
        { label: 'Contact', to: '/' },
      ],
    },
  ];
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="section grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-600">
            The friendliest place to find work — or hire the next great teammate.
          </p>
          <div className="mt-4 flex gap-2">
            {[
              { label: 'GitHub', href: 'https://github.com/mokurala-srivani', icon: 'M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1 3 .8.1-.6.3-1 .6-1.3-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0012 2z' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/srivani-mokurala-016505225/', icon: 'M4.98 3.5a2.5 2.5 0 11.04 5 2.5 2.5 0 01-.04-5zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z' },
              { label: 'Email', href: 'mailto:mokuralasrivani55@gmail.com', icon: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v.5l8 5 8-5V6H4zm16 2.4l-7.4 4.6a1 1 0 01-1.2 0L4 8.4V18h16V8.4z' },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.icon} /></svg>
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-600 transition hover:text-brand-700">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="section flex flex-col items-center justify-between gap-2 py-4 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} JobBoard. All rights reserved.</span>
          <span>
            Built with care by{' '}
            <a
              href="https://www.linkedin.com/in/srivani-mokurala-016505225/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-700 hover:text-brand-700"
            >
              Srivani Mokurala
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
