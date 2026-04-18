'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, Tag, User } from 'lucide-react';

const TABS = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/post/new', icon: PlusSquare, label: 'Create', primary: true },
  { href: '/offers', icon: Tag, label: 'Offers' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {TABS.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname.startsWith(href);
          if (primary) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 -mt-3">
                  <Icon size={22} className="text-white" />
                </div>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 py-1.5 px-3">
              <Icon
                size={22}
                className={isActive ? 'text-orange-500' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] ${isActive ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
