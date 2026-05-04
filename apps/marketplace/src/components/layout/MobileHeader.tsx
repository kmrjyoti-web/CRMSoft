'use client';

import Link from 'next/link';
import { Search, Bell } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function MobileHeader({
  title,
  showLogo = true,
  showSearch = true,
  showNotifications = true,
  onBack,
  rightContent,
}: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 safe-area-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {onBack ? (
          <button onClick={onBack} className="p-1 -ml-1 text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <div>
            {showLogo ? (
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Marketplace
              </span>
            ) : (
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {rightContent}
          {showSearch && (
            <Link href="/search" className="p-2 text-gray-600 hover:text-gray-900">
              <Search size={22} />
            </Link>
          )}
          {showNotifications && (
            <Link href="/notifications" className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
