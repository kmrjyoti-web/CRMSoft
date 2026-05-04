// Google Integration types

export type GoogleServiceId = 'gmail' | 'calendar' | 'docs' | 'meet' | 'contacts';

export type GoogleServiceStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface GoogleServiceStatusItem {
  serviceId: GoogleServiceId;
  enabled: boolean;
  status: GoogleServiceStatus;
  lastSyncAt: string | null;
  errorMessage: string | null;
  stats?: Record<string, number>;
}

export interface GoogleConnectionStatus {
  isConnected: boolean;
  googleEmail: string | null;
  googleName: string | null;
  googleAvatar: string | null;
  connectedAt: string | null;
  services: GoogleServiceStatusItem[];
}

export interface GoogleOAuthInitiatePayload {
  services: GoogleServiceId[];
}

export interface GoogleOAuthInitiateResult {
  authUrl: string;
}

export interface GoogleOAuthCallbackPayload {
  code: string;
  services: GoogleServiceId[];
}

export interface GoogleDisconnectPayload {
  services?: GoogleServiceId[];
}

export interface GoogleCalendarSettings {
  syncDirection: 'ONE_WAY_TO_CRM' | 'ONE_WAY_FROM_CRM' | 'TWO_WAY';
  defaultCalendarId: string | null;
  syncFrequencyMinutes: number;
}

export interface GoogleContactsSettings {
  syncDirection: 'ONE_WAY_TO_CRM' | 'ONE_WAY_FROM_CRM' | 'TWO_WAY';
  conflictResolution: 'crm_wins' | 'google_wins' | 'newer_wins';
}

export interface GoogleMeetSettings {
  defaultDurationMinutes: number;
  guestPermissions: 'can_modify' | 'can_invite' | 'view_only';
}

export interface GoogleDocsSettings {
  defaultFolderId: string | null;
  defaultFolderName: string | null;
}
