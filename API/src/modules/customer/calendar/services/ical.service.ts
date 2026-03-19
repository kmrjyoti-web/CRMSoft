import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { randomUUID } from 'crypto';

/**
 * iCalendar (RFC 5545) export/import service.
 * Generates and parses .ics files without external dependencies.
 */
@Injectable()
export class ICalService {
  private readonly logger = new Logger(ICalService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export scheduled events as an iCalendar (.ics) string.
   */
  async exportToIcs(
    userId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<string> {
    const events = await this.prisma.scheduledEvent.findMany({
      where: {
        tenantId,
        organizerId: userId,
        isActive: true,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      orderBy: { startTime: 'asc' },
      take: 500,
    });

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CRM-SOFT//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const event of events) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@crm-soft`);
      lines.push(`DTSTAMP:${this.formatDate(event.createdAt)}`);

      if (event.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${this.formatDateOnly(event.startTime)}`);
        lines.push(`DTEND;VALUE=DATE:${this.formatDateOnly(event.endTime)}`);
      } else {
        lines.push(`DTSTART:${this.formatDate(event.startTime)}`);
        lines.push(`DTEND:${this.formatDate(event.endTime)}`);
      }

      lines.push(`SUMMARY:${this.escapeIcalText(event.title)}`);
      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeIcalText(event.description)}`);
      }
      if (event.location) {
        lines.push(`LOCATION:${this.escapeIcalText(event.location)}`);
      }
      lines.push(`STATUS:${this.mapStatus(event.status)}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    this.logger.log(`Exported ${events.length} events to iCal for user ${userId}`);
    return lines.join('\r\n');
  }

  /**
   * Import events from an iCalendar (.ics) string.
   * Basic parser: splits by BEGIN:VEVENT/END:VEVENT and extracts key fields.
   */
  async importFromIcs(
    icsContent: string,
    userId: string,
    tenantId: string,
  ): Promise<number> {
    const eventBlocks = icsContent.split('BEGIN:VEVENT');
    let imported = 0;

    for (let i = 1; i < eventBlocks.length; i++) {
      const block = eventBlocks[i].split('END:VEVENT')[0];
      const title = this.extractField(block, 'SUMMARY');
      const dtStart = this.extractField(block, 'DTSTART') || this.extractField(block, 'DTSTART;VALUE=DATE');
      const dtEnd = this.extractField(block, 'DTEND') || this.extractField(block, 'DTEND;VALUE=DATE');
      const description = this.extractField(block, 'DESCRIPTION');
      const location = this.extractField(block, 'LOCATION');

      if (!title || !dtStart) continue;

      const startTime = this.parseIcalDate(dtStart);
      const endTime = dtEnd ? this.parseIcalDate(dtEnd) : new Date(startTime.getTime() + 3600000);
      const allDay = dtStart.length === 8; // DATE-only format: YYYYMMDD

      const count = await this.prisma.scheduledEvent.count({ where: { tenantId } });
      const eventNumber = `EVT-${String(count + 1).padStart(5, '0')}`;

      await this.prisma.scheduledEvent.create({
        data: {
          tenantId,
          eventNumber,
          type: 'OTHER',
          title: this.unescapeIcalText(title),
          description: description ? this.unescapeIcalText(description) : null,
          location: location ? this.unescapeIcalText(location) : null,
          startTime,
          endTime,
          allDay,
          organizerId: userId,
          createdById: userId,
          syncProvider: 'ICAL',
        },
      });
      imported++;
    }

    this.logger.log(`Imported ${imported} events from iCal for user ${userId}`);
    return imported;
  }

  /**
   * Generate a unique feed token for public iCal feed access.
   * Returns a UUID-based token.
   */
  generateFeedToken(_userId: string, _tenantId: string): string {
    return randomUUID();
  }

  // ─── Private helpers ──────────────────────────────────────────

  private formatDate(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private formatDateOnly(d: Date): string {
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private escapeIcalText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  private unescapeIcalText(text: string): string {
    return text.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  }

  private extractField(block: string, field: string): string | null {
    // Match both "FIELD:value" and "FIELD;PARAMS:value"
    const regex = new RegExp(`(?:^|\\n)${field}(?:;[^:]*)?:(.+?)(?:\\r?\\n|$)`, 'm');
    const match = block.match(regex);
    return match ? match[1].trim() : null;
  }

  private parseIcalDate(dateStr: string): Date {
    // Handle YYYYMMDD (all-day) and YYYYMMDDTHHmmssZ (datetime)
    const clean = dateStr.replace(/[^0-9TZ]/g, '');
    if (clean.length === 8) {
      return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00Z`);
    }
    return new Date(
      `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T${clean.slice(9, 11)}:${clean.slice(11, 13)}:${clean.slice(13, 15)}Z`,
    );
  }

  private mapStatus(status: string): string {
    switch (status) {
      case 'CANCELLED': return 'CANCELLED';
      case 'CONFIRMED': return 'CONFIRMED';
      default: return 'TENTATIVE';
    }
  }
}
