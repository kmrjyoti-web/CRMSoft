'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Palette, Globe, DollarSign, BarChart2, Receipt, LogOut, Zap, Code2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Branding', href: '/branding', icon: Palette },
  { label: 'Domains', href: '/domains', icon: Globe },
  { label: 'Pricing', href: '/pricing', icon: DollarSign },
  { label: 'Features', href: '/feature-flags', icon: Zap },
  { label: 'Dev Requests', href: '/dev-requests', icon: Code2 },
  { label: 'Errors', href: '/errors', icon: AlertCircle },
  { label: 'Tests', href: '/tests', icon: CheckCircle2 },
  { label: 'Usage', href: '/usage', icon: BarChart2 },
  { label: 'Billing', href: '/billing', icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, partnerCode, email } = useAuthStore();
  const router = useRouter();
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="text-lg font-bold text-white">Partner Portal</div>
        <div className="text-xs text-gray-500 mt-1">{partnerCode || 'Loading...'}</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
              pathname.startsWith(href) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <div className="text-xs text-gray-500 truncate">{email}</div>
        </div>
        <button onClick={() => { logout(); router.push('/login'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 w-full transition"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
