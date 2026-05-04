'use client';
import { useAuthStore } from '@/stores/auth.store';

export function Header() {
  const { email } = useAuthStore();
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white">
          {email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-400">{email}</span>
      </div>
    </header>
  );
}
