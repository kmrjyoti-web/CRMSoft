import type { IconName } from '@/components/ui';
import type { GoogleServiceId } from '../types/google-integration.types';

export interface GoogleServiceMeta {
  id: GoogleServiceId;
  label: string;
  description: string;
  icon: IconName;
  color: string;
  settingsRoute?: string;
}

export const GOOGLE_SERVICES: GoogleServiceMeta[] = [
  {
    id: 'gmail',
    label: 'Gmail',
    description: 'Read, send, and manage emails directly from the CRM',
    icon: 'mail',
    color: '#EA4335',
    settingsRoute: '/settings/email',
  },
  {
    id: 'calendar',
    label: 'Google Calendar',
    description: 'Sync events, create and manage calendar entries',
    icon: 'calendar',
    color: '#4285F4',
  },
  {
    id: 'docs',
    label: 'Google Docs',
    description: 'Create, edit, and share documents linked to CRM records',
    icon: 'file-text',
    color: '#4285F4',
  },
  {
    id: 'meet',
    label: 'Google Meet',
    description: 'Create meeting links and schedule video calls',
    icon: 'video',
    color: '#00897B',
  },
  {
    id: 'contacts',
    label: 'Google Contacts',
    description: 'Sync contacts bidirectionally between Google and CRM',
    icon: 'users',
    color: '#4285F4',
  },
];
