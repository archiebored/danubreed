import { Link } from 'react-router-dom';
import { UserPlus, Phone, Lock } from 'lucide-react';

const links = [
  { to: '/signup', label: 'Sign up', icon: UserPlus },
  { to: '/contact', label: 'Coordinators', icon: Phone },
  { to: '/staff/login', label: 'Staff login', icon: Lock },
];

export default function More() {
  return (
    <div className="pt-2 max-w-lg mx-auto">
      <h1 className="text-xl font-medium mb-4">More</h1>
      <div className="flex flex-col gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-lg bg-surface-light dark:bg-surface-dark px-4 py-3"
          >
            <Icon size={18} className="text-accent" />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}