import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Mail, Clock, Phone, Lock, LogOut, Tent, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/staff/dashboard' },
  { label: 'Members', icon: Users, to: '/staff/members' },
  { label: 'Events', icon: Calendar, to: '/staff/events' },
  { label: "Daniel's Camp", icon: Tent, to: '/staff/camp' },
  { label: 'Camp check-in', icon: UserCheck, to: '/staff/camp/check-in' },
  { label: 'Confessions', icon: Mail, to: '/staff/confessions' },
  { label: 'Service times', icon: Clock, to: '/staff/service-times' },
  { label: 'Coordinators', icon: Phone, to: '/staff/coordinators' },
];

export default function AdminLayout() {
  const { staff, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-accent bg-accent/10' : 'text-muted-dark hover:text-accent hover:bg-accent/5'
    }`;

  return (
    <div className="min-h-screen flex bg-base-dark text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(249,115,22,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <aside className="relative z-10 w-56 flex-shrink-0 bg-surface-dark border-r border-white/10 p-5 flex flex-col gap-1 overflow-y-auto">
        <p className="font-display text-xl tracking-wide text-accent mb-1">Da Nu Breed</p>
        <p className="text-[11px] text-muted-dark uppercase tracking-wide mb-6">Staff panel</p>

        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink key={label} to={to} className={linkClass}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {staff?.role === 'admin' ? (
          <NavLink to="/staff/roles" className={linkClass}>
            <Lock size={16} />
            Roles
          </NavLink>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted-dark opacity-50">
            <Lock size={16} />
            Roles — admin only
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/10">
          <p className="text-xs font-semibold px-3 truncate">{staff?.full_name}</p>
          <p className="text-[11px] text-accent capitalize px-3 mb-2">{staff?.role}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-muted-dark px-3 py-1.5 hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}