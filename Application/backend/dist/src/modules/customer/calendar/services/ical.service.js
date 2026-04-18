"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ICalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const crypto_1 = require("crypto");
let ICalService = ICalService_1 = class ICalService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ICalService_1.name);
    }
    async exportToIcs(userId, tenantId, startDate, endDate) {
        const events = await this.prisma.working.scheduledEvent.findMany({
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
        const lines = [
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
            }
            else {
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
    async importFromIcs(icsContent, userId, tenantId) {
        const eventBlocks = icsContent.split('BEGIN:VEVENT');
        let imported = 0;
        for (let i = 1; i < eventBlocks.length; i++) {
            const block = eventBlocks[i].split('END:VEVENT')[0];
            const title = this.extractField(block, 'SUMMARY');
            const dtStart = this.extractField(block, 'DTSTART') || this.extractField(block, 'DTSTART;VALUE=DATE');
            const dtEnd = this.extractField(block, 'DTEND') || this.extractField(block, 'DTEND;VALUE=DATE');
            const description = this.extractField(block, 'DESCRIPTION');
            const location = this.extractField(block, 'LOCATION');
            if (!title || !dtStart)
                continue;
            const startTime = this.parseIcalDate(dtStart);
            const endTime = dtEnd ? this.parseIcalDate(dtEnd) : new Date(startTime.getTime() + 3600000);
            const allDay = dtStart.length === 8;
            const count = await this.prisma.working.scheduledEvent.count({ where: { tenantId } });
            const eventNumber = `EVT-${String(count + 1).padStart(5, '0')}`;
            await this.prisma.working.scheduledEvent.create({
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
    generateFeedToken(_userId, _tenantId) {
        return (0, crypto_1.randomUUID)();
    }
    formatDate(d) {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    formatDateOnly(d) {
        return d.toISOString().slice(0, 10).replace(/-/g, '');
    }
    escapeIcalText(text) {
        return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    }
    unescapeIcalText(text) {
        return text.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
    }
    extractField(block, field) {
        const regex = new RegExp(`(?:^|\\n)${field}(?:;[^:]*)?:(.+?)(?:\\r?\\n|$)`, 'm');
        const match = block.match(regex);
        return match ? match[1].trim() : null;
    }
    parseIcalDate(dateStr) {
        const clean = dateStr.replace(/[^0-9TZ]/g, '');
        if (clean.length === 8) {
            return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00Z`);
        }
        return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T${clean.slice(9, 11)}:${clean.slice(11, 13)}:${clean.slice(13, 15)}Z`);
    }
    mapStatus(status) {
        switch (status) {
            case 'CANCELLED': return 'CANCELLED';
            case 'CONFIRMED': return 'CONFIRMED';
            default: return 'TENTATIVE';
        }
    }
};
exports.ICalService = ICalService;
exports.ICalService = ICalService = ICalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ICalService);
//# sourceMappingURL=ical.service.js.map