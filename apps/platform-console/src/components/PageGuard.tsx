'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { usePageAccess } from '@/hooks/usePageAccess';
import { AccessDenied } from './AccessDenied';

interface Props {
  pageCode: string;
  children: ReactNode;
  accessDeniedMessage?: string;
}

export function PageGuard({ pageCode, children, accessDeniedMessage }: Props) {
  const { loading, canRead } = usePageAccess();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
      </div>
    );
  }

  if (!canRead(pageCode)) {
    return <AccessDenied pageCode={pageCode} message={accessDeniedMessage} />;
  }

  return <>{children}</>;
}
