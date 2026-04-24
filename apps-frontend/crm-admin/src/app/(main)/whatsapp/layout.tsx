'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Icon, type IconName } from '@/components/ui';

const WA_TABS: { label: string; path: string; icon: IconName }[] = [
  { label: 'Dashboard', path: '/whatsapp', icon: 'bar-chart-2' },
  { label: 'Conversations', path: '/whatsapp/conversations', icon: 'message-square' },
  { label: 'Templates', path: '/whatsapp/templates', icon: 'file-text' },
  { label: 'Broadcasts', path: '/whatsapp/broadcasts', icon: 'radio' },
  { label: 'Chatbot', path: '/whatsapp/chatbot', icon: 'bot' },
  { label: 'Quick Replies', path: '/whatsapp/quick-replies', icon: 'zap' },
  { label: 'Opt-outs', path: '/whatsapp/opt-outs', icon: 'user-x' },
];

export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (tab: { path: string }) => {
    if (tab.path === '/whatsapp') return pathname === '/whatsapp';
    return pathname.startsWith(tab.path);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid #e5e7eb',
          background: '#fff',
          paddingLeft: 16,
          paddingRight: 16,
          overflowX: 'auto',
        }}
      >
        {WA_TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? '#2563eb' : '#64748b',
                borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                background: 'transparent',
                border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: active ? '#2563eb' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              <Icon name={tab.icon} size={15} color={active ? '#2563eb' : '#94a3b8'} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
