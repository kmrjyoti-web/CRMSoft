'use client';

import { useCallback } from 'react';
import type { ReactNode } from 'react';

import { Button, Icon } from '@/components/ui';
import { useContentPanel } from '@/hooks/useEntityPanel';
import { useAuthStore } from '@/stores/auth.store';

const DEVELOPER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'];

interface HelpButtonProps {
  panelId: string;
  title: string;
  userContent: ReactNode;
  devContent?: ReactNode;
  width?: number;
  label?: string;
  showLabel?: boolean;
}

export function HelpButton({
  panelId,
  title,
  userContent,
  devContent,
  width = 520,
  label = 'Help',
  showLabel = true,
}: HelpButtonProps) {
  const { openContent } = useContentPanel();
  const roles = useAuthStore((s) => s.roles);
  const isDeveloper = devContent != null && roles.some((r) => DEVELOPER_ROLES.includes(r));

  const handleClick = useCallback(() => {
    openContent({
      id: panelId,
      title,
      icon: 'help-circle',
      width,
      content: isDeveloper ? devContent : userContent,
    });
  }, [openContent, panelId, title, width, isDeveloper, devContent, userContent]);

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Icon name="help-circle" size={16} />
      {showLabel && <span className="ml-1">{label}</span>}
    </Button>
  );
}
