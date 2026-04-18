export interface CalendarProviderAdapter {
    readonly provider: string;
    getAuthUrl(redirectUri: string, state: string): string;
    exchangeCode(code: string, redirectUri: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresAt: Date;
    }>;
    listEvents(accessToken: string, calendarId: string, syncToken?: string): Promise<{
        events: ExternalEvent[];
        nextSyncToken?: string;
    }>;
    createEvent(accessToken: string, calendarId: string, event: ExternalEventInput): Promise<string>;
    updateEvent(accessToken: string, calendarId: string, eventId: string, event: ExternalEventInput): Promise<void>;
    deleteEvent(accessToken: string, calendarId: string, eventId: string): Promise<void>;
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
    attendees?: {
        email: string;
        name?: string;
        status?: string;
    }[];
}
export interface ExternalEventInput {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    location?: string;
    attendees?: {
        email: string;
        name?: string;
    }[];
}
