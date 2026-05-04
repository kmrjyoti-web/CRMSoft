'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { useLogout } from '../../../hooks/useAuth';
import { Avatar } from '../../../components/common/Avatar';
import { ChevronRight, Package, MessageSquare, Star, LogOut, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

const MENU_ITEMS = [
  { icon: Package, label: 'My Listings', href: '/discover' },
  { icon: MessageSquare, label: 'My Enquiries', href: '/enquiries' },
  { icon: Star, label: 'My Requirements', href: '/requirements' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Shield, label: 'Privacy & Security', href: '#' },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-full">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-6 pb-12">
        <div className="flex items-center gap-4">
          <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size={64} />
          <div>
            <h1 className="text-white font-bold text-xl">{user.firstName} {user.lastName}</h1>
            {user.businessName && (
              <p className="text-orange-100 text-sm">{user.businessName}</p>
            )}
            <p className="text-orange-200 text-xs">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-3 pb-8">
        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Listings', value: 0 },
            { label: 'Enquiries', value: 0 },
            { label: 'Reviews', value: 0 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {MENU_ITEMS.map(({ icon: Icon, label, href }, idx) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 ${idx > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
                <Icon size={16} className="text-orange-500" />
              </div>
              <span className="flex-1 text-sm text-gray-800 font-medium">{label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => logout.mutate()}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl shadow-sm border border-gray-100 py-4 text-red-500 font-medium text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
