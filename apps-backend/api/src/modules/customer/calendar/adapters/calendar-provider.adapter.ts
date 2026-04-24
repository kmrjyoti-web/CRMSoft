/**
 * Interface for external calendar provider adapters (Google, Outlook, etc.).
 * Each provider implements this interface to enable two-way calendar sync.
 */
export interface CalendarProviderAdapter {
  readonly provider: string;

  /**
   * Generate the OAuth2 authorization URL for connecting the provider.
   */
  getAuthUrl(redirectUri: string, state: string): string;

  /**
   * Exchange an authorization code for access and refresh tokens.
   */
  exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }>;

  /**
   * Refresh an expired access token using the refresh token.
   */
  refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date }>;

  /**
   * List events from the external calendar, optionally using a sync token
   * for incremental sync.
   */
  listEvents(
    accessToken: string,
    calendarId: string,
    syncToken?: string,
  ): Promise<{ events: ExternalEvent[]; nextSyncToken?: string }>;

  /**
   * Create an event in the external calendar. Returns the external event ID.
   */
  createEvent(
    accessToken: string,
    calendarId: string,
    event: ExternalEventInput,
  ): Promise<string>;

  /**
   * Update an existing event in the external calendar.
   */
  updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    event: ExternalEventInput,
  ): Promise<void>;

  /**
   * Delete an event from the external calendar.
   */
  deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
  ): Promise<void>;
}

export interface ExternalEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  location?: string;
  status?: string;
  attendees?: { email: string; name?: string; status?: string }[];
}

export interface ExternalEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  location?: string;
  attendees?: { email: string; name?: string }[];
}
