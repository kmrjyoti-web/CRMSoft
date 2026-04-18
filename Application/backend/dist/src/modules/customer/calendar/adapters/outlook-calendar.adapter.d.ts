import { CalendarProviderAdapter, ExternalEvent, ExternalEventInput } from './calendar-provider.adapter';
export declare class OutlookCalendarAdapter implements CalendarProviderAdapter {
    readonly provider = "OUTLOOK";
    private readonly logger;
    getAuthUrl(redirectUri: string, _state: string): string;
    exchangeCode(_code: string, _redirectUri: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    refreshAccessToken(_refreshToken: string): Promise<{
        accessToken: string;
        expiresAt: Date;
    }>;
    listEvents(_accessToken: string, _calendarId: string, _syncToken?: string): Promise<{
        events: ExternalEvent[];
        nextSyncToken?: string;
    }>;
    createEvent(_accessToken: string, _calendarId: string, _event: ExternalEventInput): Promise<string>;
    updateEvent(_accessToken: string, _calendarId: string, _eventId: string, _event: ExternalEventInput): Promise<void>;
    deleteEvent(_accessToken: string, _calendarId: string, _eventId: string): Promise<void>;
}
