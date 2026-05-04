'use client';

import { useEffect } from 'react';
import { BottomNav } from '../../components/layout/BottomNav';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { InstallPrompt } from '../../components/layout/InstallPrompt';
import { useUiStore } from '../../stores/uiStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const setOffline = useUiStore((s) => s.setOffline);
  const isOffline = useUiStore((s) => s.isOffline);

  useEffect(() => {
    const online = () => setOffline(false);
    const offline = () => setOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, [setOffline]);

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50 max-w-lg mx-auto relative">
      <MobileHeader />

      {isOffline && (
        <div className="fixed top-14 left-0 right-0 z-40 max-w-lg mx-auto">
          <div className="bg-red-500 text-white text-xs text-center py-1.5 font-medium">
            You are offline — showing cached content
          </div>
        </div>
      )}

      <main className="flex-1 pt-14 pb-20 overflow-y-auto">
        {children}
      </main>

      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
