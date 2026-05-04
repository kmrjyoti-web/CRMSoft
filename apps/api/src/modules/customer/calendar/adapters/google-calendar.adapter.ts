import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import {
  CalendarProviderAdapter,
  ExternalEvent,
  ExternalEventInput,
} from './calendar-provider.adapter';

const STUB_MESSAGE = 'Google Calendar integration pending API key setup';

/**
 * Stub implementation for Google Calendar.
 * All methods log a warning and throw NotImplementedException until
 * Google API credentials are configured.
 */
@Injectable()
export class GoogleCalendarAdapter implements CalendarProviderAdapter {
  readonly provider = 'GOOGLE';
  private readonly logger = new Logger(GoogleCalendarAdapter.name);

  getAuthUrl(redirectUri: string, _state: string): string {
    this.logger.warn(`${STUB_MESSAGE} — getAuthUrl called with redirect: ${redirectUri}`);
    throw new NotImplementedException(STUB_MESSAGE);
  }

  async exchangeCode(
    _code: string,
    _redirectUri: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    this.logger.warn(`${STUB_MESSAGE} — exchangeCode called`);
    throw new NotImplementedException(STUB_MESSAGE);
  }

  async refreshAccessToken(
    _refreshToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    this.logger.warn(`${STUB_MESSAGE} — refreshAccessToken called`);
    throw new NotImplementedException(STUB_MESSAGE);
  }

  async listEvents(
    _accessToken: string,
    _calendarId: string,
    _syncToken?: string,
  ): Promise<{ events: ExternalEvent[]; nextSyncToken?: string }> {
    this.logger.warn(`${STUB_MESSAGE} — listEvents called`);
    throw new NotImplementedException(STUB_MESSAGE);
  }

  async createEvent(
    _accessToken: string,
    _calendarId: string,
    _event: ExternalEventInput,
  ): Promise<string> {
    this.logger.warn(`${STUB_MESSAGE} — createEvent called`);
    throw new NotImplementedException(STUB_MESSAGE);
  }

  async updateEvent(
    _accessToken: string,
    _calendarId: string,
    _eventId: string,
    _event: ExternalEventInput,
  ): Promise<void> {
    this.logger.warn(`${STUB_MESSAGE} — updateEvent called`);
    throw new NotImplementedException(STUB_MESSAGE);
  }

  async deleteEvent(
    _accessToken: string,
    _calendarId: string,
    _eventId: string,
  ): Promise<void> {
    this.logger.warn(`${STUB_MESSAGE} — deleteEvent called`);
    throw new NotImplementedException(STUB_MESSAGE);
  }
}
