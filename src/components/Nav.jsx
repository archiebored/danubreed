import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/give', label: 'Give' },
  { to: '/confess', label: 'Confess' },
  { to: '/signup', label: 'Sign up' },
  { to: '/login', label: 'Log in' },
  { to: '/contact', label: 'Coordinators' },
];

export default function Nav() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-28px)] max-w-[400px] lg:max-w-[820px] flex items-center justify-between gap-2 rounded-full border border-black/10 dark:border-white/10 bg-base-light/85 dark:bg-[#0e0e0e]/85 backdrop-blur-xl px-4 lg:px-5 py-2 shadow-lg shadow-black/10 dark:shadow-black/30 transition-shadow duration-300">
        <Link to="/" className="font-display text-lg tracking-wide text-accent flex-shrink-0 transition-transform duration-200 hover:scale-105 inline-block">Da Nu Breed</Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-accent bg-accent/10 border border-accent/30'
                    : 'text-muted-light dark:text-muted-dark border border-transparent hover:text-accent hover:bg-accent/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-muted-light dark:text-muted-dark transition-all duration-300 hover:rotate-45 hover:text-accent hover:border-accent/40"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-ink-light dark:text-ink-dark transition-transform duration-200 active:scale-90"
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-base-light dark:bg-base-dark flex flex-col gap-2 px-6 py-[90px] animate-[fadeIn_0.2s_ease]">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute top-4 right-4 w-9 h-9 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform duration-200 active:scale-90 hover:rotate-90"
          >
            <X size={18} />
          </button>
          {links.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={({ isActive }) =>
                `px-5 py-4 rounded-2xl text-base font-semibold border transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-accent border-accent/30 bg-accent/10'
                    : 'text-muted-light dark:text-muted-dark border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark hover:border-accent/30'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}