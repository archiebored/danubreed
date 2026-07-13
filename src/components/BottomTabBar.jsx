import { NavLink } from 'react-router-dom';
import { Home, Calendar, Heart, Mail, Menu } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/give', label: 'Give', icon: Heart },
  { to: '/confess', label: 'Confess', icon: Mail },
  { to: '/more', label: 'More', icon: Menu },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-base-light/95 dark:bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-black/10 dark:border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-[62px]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive ? 'text-accent' : 'text-muted-light dark:text-muted-dark'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'scale-110 transition-transform duration-200' : 'transition-transform duration-200'} />
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}