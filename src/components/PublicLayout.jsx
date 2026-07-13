import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import AppTopBar from './AppTopBar';
import BottomTabBar from './BottomTabBar';
import InstallBanner from './InstallBanner';
import { useStandalone } from '../hooks/useStandalone';

export default function PublicLayout() {
  const isStandalone = useStandalone();

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-base-light dark:bg-base-dark text-ink-light dark:text-ink-dark">
        <AppTopBar />
        <main className="pt-14 pb-[62px]">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-base-light dark:bg-base-dark text-ink-light dark:text-ink-dark">
      <div
        className="pointer-events-none fixed inset-0 opacity-20 dark:opacity-100"
        style={{
          backgroundImage:
            'linear-gradient(rgba(249,115,22,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none fixed -top-56 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-60 dark:opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)' }}
      />

      <Nav />
      <main className="relative px-4 sm:px-8 pb-16 pt-[104px]">
        <Outlet />
      </main>
      <InstallBanner />
    </div>
  );
}