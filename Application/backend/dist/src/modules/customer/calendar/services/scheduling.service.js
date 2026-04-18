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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../core/prisma/cross-db-resolver.service");
const calendar_sync_service_1 = require("../calendar-sync.service");
const notification_dispatch_service_1 = require("../../../core/work/notifications/services/notification-dispatch.service");
const calendar_visibility_service_1 = require("./calendar-visibility.service");
let SchedulingService = class SchedulingService {
    constructor(prisma, resolver, calendarSync, notifications, visibility) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.calendarSync = calendarSync;
        this.notifications = notifications;
        this.visibility = visibility;
    }
    async createEvent(dto, userId, tenantId, roleLevel) {
        const count = await this.prisma.working.scheduledEvent.count({ where: { tenantId } });
        const eventNumber = `EVT-${String(count + 1).padStart(4, '0')}`;
        const event = await this.prisma.working.scheduledEvent.create({
            data: {
                tenantId,
                eventNumber,
                type: dto.type,
                title: dto.title,
                description: dto.description,
                location: dto.location,
                meetingLink: dto.meetingLink,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                allDay: dto.allDay ?? false,
                timezone: dto.timezone ?? 'Asia/Kolkata',
                color: dto.color,
                recurrencePattern: dto.recurrencePattern ?? 'NONE',
                recurrenceConfig: dto.recurrenceConfig,
                reminderMinutes: dto.reminderMinutes,
                entityType: dto.entityType,
                entityId: dto.entityId,
                organizerId: userId,
                createdById: userId,
            },
        });
        await this.prisma.working.eventParticipant.create({
            data: { tenantId, eventId: event.id, userId, role: 'ORGANIZER', rsvpStatus: 'ACCEPTED', rsvpAt: new Date() },
        });
        if (dto.participants?.length) {
            await this.prisma.working.eventParticipant.createMany({
                data: dto.participants.map((p) => ({
                    tenantId, eventId: event.id, userId: p.userId ?? null,
                    email: p.email ?? null, name: p.name ?? null,
                    role: p.role ?? 'ATTENDEE', isExternal: !p.userId,
                })),
                skipDuplicates: true,
            });
        }
        await this.calendarSync.syncEvent({
            eventType: 'SCHEDULED_EVENT', sourceId: event.id, title: event.title,
            description: event.description ?? undefined, startTime: event.startTime,
            endTime: event.endTime, allDay: event.allDay, color: event.color ?? undefined,
            userId, tenantId, location: event.location ?? undefined, meetingLink: event.meetingLink ?? undefined,
        });
        await this.prisma.working.eventHistory.create({
            data: { tenantId, eventId: event.id, action: 'CREATED', changedById: userId },
        });
        await this.notifications.dispatch({
            tenantId, eventType: 'CALENDAR_EVENT_CREATED', entityType: 'ScheduledEvent',
            entityId: event.id, actorId: userId, data: { title: event.title, startTime: event.startTime.toISOString() },
        });
        return event;
    }
    async updateEvent(id, dto, userId, tenantId) {
        const event = await this.findEventOrThrow(id, tenantId);
        this.validateOwnership(event, userId);
        const changes = [];
        const data = {};
        const trackableFields = ['title', 'description', 'location', 'meetingLink', 'color', 'allDay', 'timezone'];
        for (const field of trackableFields) {
            if (dto[field] !== undefined && dto[field] !== event[field]) {
                changes.push({ field, oldValue: String(event[field] ?? ''), newValue: String(dto[field]) });
                data[field] = dto[field];
            }
        }
        if (dto.startTime) {
            data.startTime = new Date(dto.startTime);
            changes.push({ field: 'startTime', oldValue: event.startTime.toISOString(), newValue: dto.startTime });
        }
        if (dto.endTime) {
            data.endTime = new Date(dto.endTime);
            changes.push({ field: 'endTime', oldValue: event.endTime.toISOString(), newValue: dto.endTime });
        }
        if (dto.recurrencePattern)
            data.recurrencePattern = dto.recurrencePattern;
        if (dto.recurrenceConfig !== undefined)
            data.recurrenceConfig = dto.recurrenceConfig;
        if (dto.reminderMinutes !== undefined)
            data.reminderMinutes = dto.reminderMinutes;
        if (dto.entityType !== undefined)
            data.entityType = dto.entityType;
        if (dto.entityId !== undefined)
            data.entityId = dto.entityId;
        const updated = await this.prisma.working.scheduledEvent.update({ where: { id }, data });
        for (const change of changes) {
            await this.prisma.working.eventHistory.create({
                data: { tenantId, eventId: id, action: 'UPDATED', field: change.field, oldValue: change.oldValue, newValue: change.newValue, changedById: userId },
            });
        }
        await this.calendarSync.syncEvent({
            eventType: 'SCHEDULED_EVENT', sourceId: id, title: updated.title,
            description: updated.description ?? undefined, startTime: updated.startTime,
            endTime: updated.endTime, allDay: updated.allDay, color: updated.color ?? undefined,
            userId: updated.organizerId, tenantId,
        });
        return updated;
    }
    async cancelEvent(id, reason, userId, tenantId) {
        const event = await this.findEventOrThrow(id, tenantId);
        this.validateOwnership(event, userId);
        const updated = await this.prisma.working.scheduledEvent.update({
            where: { id },
            data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason ?? null, isActive: false },
        });
        await this.prisma.working.eventHistory.create({
            data: { tenantId, eventId: id, action: 'CANCELLED', field: 'status', oldValue: event.status, newValue: 'CANCELLED', changedById: userId },
        });
        const participants = await this.prisma.working.eventParticipant.findMany({ where: { eventId: id, userId: { not: userId } }, select: { userId: true } });
        for (const p of participants) {
            if (p.userId) {
                await this.notifications.dispatch({
                    tenantId, eventType: 'CALENDAR_EVENT_CANCELLED', entityType: 'ScheduledEvent',
                    entityId: id, actorId: userId, data: { title: event.title, reason: reason ?? '' },
                });
            }
        }
        return updated;
    }
    async rescheduleEvent(id, newStartTime, newEndTime, userId, tenantId) {
        const event = await this.findEventOrThrow(id, tenantId);
        this.validateOwnership(event, userId);
        const updated = await this.prisma.working.scheduledEvent.update({
            where: { id },
            data: { startTime: new Date(newStartTime), endTime: new Date(newEndTime), status: 'RESCHEDULED' },
        });
        await this.prisma.working.eventParticipant.updateMany({
            where: { eventId: id, role: { not: 'ORGANIZER' } },
            data: { rsvpStatus: 'PENDING', rsvpAt: null },
        });
        await this.prisma.working.eventHistory.create({
            data: {
                tenantId, eventId: id, action: 'RESCHEDULED', field: 'startTime',
                oldValue: event.startTime.toISOString(), newValue: newStartTime, changedById: userId,
            },
        });
        await this.calendarSync.syncEvent({
            eventType: 'SCHEDULED_EVENT', sourceId: id, title: updated.title,
            description: updated.description ?? undefined, startTime: updated.startTime,
            endTime: updated.endTime, allDay: updated.allDay, color: updated.color ?? undefined,
            userId: updated.organizerId, tenantId,
        });
        await this.notifications.dispatch({
            tenantId, eventType: 'CALENDAR_EVENT_RESCHEDULED', entityType: 'ScheduledEvent',
            entityId: id, actorId: userId, data: { title: event.title, newStartTime, newEndTime },
        });
        return updated;
    }
    async getEventById(id, userId, tenantId, roleLevel) {
        const ctx = { userId, roleLevel, tenantId };
        const visibilityWhere = await this.visibility.buildWhereClause(ctx);
        const event = await this.prisma.working.scheduledEvent.findFirst({
            where: { id, ...visibilityWhere },
            include: {
                participants: true,
                history: { orderBy: { createdAt: 'desc' }, take: 50 },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Scheduled event not found');
        const participants = await this.resolver.resolveUsers(event.participants, ['userId'], { id: true, firstName: true, lastName: true, email: true });
        const history = await this.resolver.resolveUsers(event.history, ['changedById'], { id: true, firstName: true, lastName: true });
        const organizer = await this.resolver.resolveUser(event.organizerId);
        return { ...event, participants, history, organizer };
    }
    async listEvents(userId, tenantId, roleLevel, page, limit, filters) {
        const ctx = { userId, roleLevel, tenantId };
        const visibilityWhere = await this.visibility.buildWhereClause(ctx);
        const where = { ...visibilityWhere, isActive: true };
        if (filters.status)
            where.status = filters.status;
        if (filters.type)
            where.type = filters.type;
        if (filters.startDate)
            where.startTime = { ...(where.startTime ?? {}), gte: new Date(filters.startDate) };
        if (filters.endDate)
            where.startTime = { ...(where.startTime ?? {}), lte: new Date(filters.endDate) };
        if (filters.search)
            where.title = { contains: filters.search, mode: 'insensitive' };
        const orderBy = {};
        orderBy[filters.sortBy ?? 'startTime'] = filters.sortOrder ?? 'desc';
        const [rawData, total] = await Promise.all([
            this.prisma.working.scheduledEvent.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy,
                include: {
                    participants: { select: { id: true, userId: true, rsvpStatus: true, role: true } },
                },
            }),
            this.prisma.working.scheduledEvent.count({ where }),
        ]);
        const data = await this.resolver.resolveUsers(rawData, ['organizerId'], { id: true, firstName: true, lastName: true });
        return { data, total, page, limit };
    }
    async addParticipant(eventId, participantDto, userId, tenantId) {
        await this.findEventOrThrow(eventId, tenantId);
        const participant = await this.prisma.working.eventParticipant.create({
            data: {
                tenantId, eventId,
                userId: participantDto.userId ?? null,
                email: participantDto.email ?? null,
                name: participantDto.name ?? null,
                role: participantDto.role ?? 'ATTENDEE',
                isExternal: !participantDto.userId,
            },
        });
        await this.prisma.working.eventHistory.create({
            data: { tenantId, eventId, action: 'PARTICIPANT_ADDED', newValue: participantDto.userId ?? participantDto.email, changedById: userId },
        });
        return participant;
    }
    async removeParticipant(eventId, participantUserId, userId, tenantId) {
        const event = await this.findEventOrThrow(eventId, tenantId);
        await this.prisma.working.eventParticipant.deleteMany({
            where: { eventId, userId: participantUserId },
        });
        await this.prisma.working.eventHistory.create({
            data: { tenantId, eventId, action: 'PARTICIPANT_REMOVED', newValue: participantUserId, changedById: userId },
        });
    }
    async updateRSVP(eventId, userId, rsvpStatus, tenantId) {
        const participant = await this.prisma.working.eventParticipant.findFirst({
            where: { eventId, userId, tenantId },
        });
        if (!participant)
            throw new common_1.NotFoundException('You are not a participant of this event');
        return this.prisma.working.eventParticipant.update({
            where: { id: participant.id },
            data: { rsvpStatus: rsvpStatus, rsvpAt: new Date() },
        });
    }
    async getEventHistory(eventId, tenantId) {
        const history = await this.prisma.working.eventHistory.findMany({
            where: { eventId, tenantId },
            orderBy: { createdAt: 'desc' },
        });
        return this.resolver.resolveUsers(history, ['changedById'], { id: true, firstName: true, lastName: true });
    }
    async findEventOrThrow(id, tenantId) {
        const event = await this.prisma.working.scheduledEvent.findFirst({ where: { id, tenantId } });
        if (!event)
            throw new common_1.NotFoundException('Scheduled event not found');
        return event;
    }
    validateOwnership(event, userId) {
        if (event.organizerId !== userId && event.createdById !== userId) {
            throw new common_1.ForbiddenException('Only the organizer can modify this event');
        }
    }
};
exports.SchedulingService = SchedulingService;
exports.SchedulingService = SchedulingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService,
        calendar_sync_service_1.CalendarSyncService,
        notification_dispatch_service_1.NotificationDispatchService,
        calendar_visibility_service_1.CalendarVisibilityService])
], SchedulingService);
//# sourceMappingURL=scheduling.service.js.map