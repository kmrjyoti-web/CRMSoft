'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!token) router.push('/login'); }, [token, router]);
  if (!token) return null;
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
