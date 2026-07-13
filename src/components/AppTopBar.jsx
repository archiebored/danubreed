import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AppTopBar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-base-light/95 dark:bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="font-display text-lg tracking-wide text-accent">Da Nu Breed</Link>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-muted-light dark:text-muted-dark transition-transform duration-300 hover:rotate-45"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}