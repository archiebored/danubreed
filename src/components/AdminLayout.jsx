import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Mail, Clock, Phone, Lock, LogOut, Tent, UserCheck, Menu, X, Image as ImageIcon } from 'lucide-react';
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
  { label: 'Gallery', icon: ImageIcon, to: '/staff/gallery' },
];

export default function AdminLayout() {
  const { staff, signOut } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-accent bg-accent/10' : 'text-muted-dark hover:text-accent hover:bg-accent/5'
    }`;

  const NavList = ({ onNavigate }) => (
    <>
      {navItems.map(({ label, icon: Icon, to }) => (
        <NavLink key={label} to={to} className={linkClass} onClick={onNavigate}>
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
      {staff?.role === 'admin' ? (
        <NavLink to="/staff/roles" className={linkClass} onClick={onNavigate}>
          <Lock size={16} />
          Roles
        </NavLink>
      ) : (
        <div className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted-dark opacity-50">
          <Lock size={16} />
          Roles — admin only
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-base-dark text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(249,115,22,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-white/10 bg-surface-dark/95 backdrop-blur-xl">
        <p className="font-display text-lg tracking-wide text-accent">Da Nu Breed</p>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center"
        >
          <Menu size={18} />
        </button>
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-base-dark flex flex-col p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-display text-xl tracking-wide text-accent">Da Nu Breed</p>
              <p className="text-[11px] text-muted-dark uppercase tracking-wide">Staff panel</p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-semibold">{staff?.full_name}</p>
            <p className="text-[11px] text-accent capitalize mb-3">{staff?.role}</p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-muted-dark hover:text-red-400 transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex">
        <aside className="hidden lg:flex w-56 flex-shrink-0 bg-surface-dark border-r border-white/10 p-5 flex-col gap-1 min-h-screen">
          <p className="font-display text-xl tracking-wide text-accent mb-1">Da Nu Breed</p>
          <p className="text-[11px] text-muted-dark uppercase tracking-wide mb-6">Staff panel</p>

          <NavList onNavigate={() => {}} />

          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-xs font-semibold px-3 truncate">{staff?.full_name}</p>
            <p className="text-[11px] text-accent capitalize px-3 mb-2">{staff?.role}</p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-muted-dark text-left px-3 hover:text-red-400 transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}