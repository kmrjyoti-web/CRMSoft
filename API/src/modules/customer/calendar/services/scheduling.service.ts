// @ts-nocheck
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CalendarSyncService } from '../calendar-sync.service';
import { NotificationDispatchService } from '../../../core/work/notifications/services/notification-dispatch.service';
import { CalendarVisibilityService, CalendarVisibilityContext } from './calendar-visibility.service';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarSync: CalendarSyncService,
    private readonly notifications: NotificationDispatchService,
    private readonly visibility: CalendarVisibilityService,
  ) {}

  async createEvent(dto: any, userId: string, tenantId: string, roleLevel: number) {
    const count = await this.prisma.scheduledEvent.count({ where: { tenantId } });
    const eventNumber = `EVT-${String(count + 1).padStart(4, '0')}`;

    const event = await this.prisma.scheduledEvent.create({
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

    // Add organizer as participant
    await this.prisma.eventParticipant.create({
      data: { tenantId, eventId: event.id, userId, role: 'ORGANIZER', rsvpStatus: 'ACCEPTED', rsvpAt: new Date() },
    });

    // Add extra participants
    if (dto.participants?.length) {
      await this.prisma.eventParticipant.createMany({
        data: dto.participants.map((p: any) => ({
          tenantId, eventId: event.id, userId: p.userId ?? null,
          email: p.email ?? null, name: p.name ?? null,
          role: p.role ?? 'ATTENDEE', isExternal: !p.userId,
        })),
        skipDuplicates: true,
      });
    }

    // Sync to CalendarEvent
    await this.calendarSync.syncEvent({
      eventType: 'SCHEDULED_EVENT', sourceId: event.id, title: event.title,
      description: event.description ?? undefined, startTime: event.startTime,
      endTime: event.endTime, allDay: event.allDay, color: event.color ?? undefined,
      userId, tenantId, location: event.location ?? undefined, meetingLink: event.meetingLink ?? undefined,
    });

    // Record history
    await this.prisma.eventHistory.create({
      data: { tenantId, eventId: event.id, action: 'CREATED', changedById: userId },
    });

    // Dispatch notification
    await this.notifications.dispatch({
      tenantId, eventType: 'CALENDAR_EVENT_CREATED', entityType: 'ScheduledEvent',
      entityId: event.id, actorId: userId, data: { title: event.title, startTime: event.startTime.toISOString() },
    });

    return event;
  }

  async updateEvent(id: string, dto: any, userId: string, tenantId: string) {
    const event = await this.findEventOrThrow(id, tenantId);
    this.validateOwnership(event, userId);

    const changes: { field: string; oldValue: string; newValue: string }[] = [];
    const data: any = {};

    const trackableFields = ['title', 'description', 'location', 'meetingLink', 'color', 'allDay', 'timezone'];
    for (const field of trackableFields) {
      if (dto[field] !== undefined && dto[field] !== (event as any)[field]) {
        changes.push({ field, oldValue: String((event as any)[field] ?? ''), newValue: String(dto[field]) });
        data[field] = dto[field];
      }
    }
    if (dto.startTime) { data.startTime = new Date(dto.startTime); changes.push({ field: 'startTime', oldValue: event.startTime.toISOString(), newValue: dto.startTime }); }
    if (dto.endTime) { data.endTime = new Date(dto.endTime); changes.push({ field: 'endTime', oldValue: event.endTime.toISOString(), newValue: dto.endTime }); }
    if (dto.recurrencePattern) data.recurrencePattern = dto.recurrencePattern;
    if (dto.recurrenceConfig !== undefined) data.recurrenceConfig = dto.recurrenceConfig;
    if (dto.reminderMinutes !== undefined) data.reminderMinutes = dto.reminderMinutes;
    if (dto.entityType !== undefined) data.entityType = dto.entityType;
    if (dto.entityId !== undefined) data.entityId = dto.entityId;

    const updated = await this.prisma.scheduledEvent.update({ where: { id }, data });

    // Record field changes
    for (const change of changes) {
      await this.prisma.eventHistory.create({
        data: { tenantId, eventId: id, action: 'UPDATED', field: change.field, oldValue: change.oldValue, newValue: change.newValue, changedById: userId },
      });
    }

    // Re-sync to CalendarEvent
    await this.calendarSync.syncEvent({
      eventType: 'SCHEDULED_EVENT', sourceId: id, title: updated.title,
      description: updated.description ?? undefined, startTime: updated.startTime,
      endTime: updated.endTime, allDay: updated.allDay, color: updated.color ?? undefined,
      userId: updated.organizerId, tenantId,
    });

    return updated;
  }

  async cancelEvent(id: string, reason: string | undefined, userId: string, tenantId: string) {
    const event = await this.findEventOrThrow(id, tenantId);
    this.validateOwnership(event, userId);

    const updated = await this.prisma.scheduledEvent.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason ?? null, isActive: false },
    });

    await this.prisma.eventHistory.create({
      data: { tenantId, eventId: id, action: 'CANCELLED', field: 'status', oldValue: event.status, newValue: 'CANCELLED', changedById: userId },
    });

    // Notify all participants
    const participants = await this.prisma.eventParticipant.findMany({ where: { eventId: id, userId: { not: userId } }, select: { userId: true } });
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

  async rescheduleEvent(id: string, newStartTime: string, newEndTime: string, userId: string, tenantId: string) {
    const event = await this.findEventOrThrow(id, tenantId);
    this.validateOwnership(event, userId);

    const updated = await this.prisma.scheduledEvent.update({
      where: { id },
      data: { startTime: new Date(newStartTime), endTime: new Date(newEndTime), status: 'RESCHEDULED' },
    });

    // Reset all participant RSVPs to PENDING
    await this.prisma.eventParticipant.updateMany({
      where: { eventId: id, role: { not: 'ORGANIZER' } },
      data: { rsvpStatus: 'PENDING', rsvpAt: null },
    });

    await this.prisma.eventHistory.create({
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

  async getEventById(id: string, userId: string, tenantId: string, roleLevel: number) {
    const ctx: CalendarVisibilityContext = { userId, roleLevel, tenantId };
    const visibilityWhere = await this.visibility.buildWhereClause(ctx);

    const event = await this.prisma.scheduledEvent.findFirst({
      where: { id, ...visibilityWhere },
      include: {
        participants: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        history: { orderBy: { createdAt: 'desc' }, take: 50, include: { changedBy: { select: { id: true, firstName: true, lastName: true } } } },
        organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!event) throw new NotFoundException('Scheduled event not found');
    return event;
  }

  async listEvents(userId: string, tenantId: string, roleLevel: number, page: number, limit: number, filters: any) {
    const ctx: CalendarVisibilityContext = { userId, roleLevel, tenantId };
    const visibilityWhere = await this.visibility.buildWhereClause(ctx);
    const where: any = { ...visibilityWhere, isActive: true };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.startDate) where.startTime = { ...(where.startTime ?? {}), gte: new Date(filters.startDate) };
    if (filters.endDate) where.startTime = { ...(where.startTime ?? {}), lte: new Date(filters.endDate) };
    if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };

    const orderBy: any = {};
    orderBy[filters.sortBy ?? 'startTime'] = filters.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.scheduledEvent.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy,
        include: {
          organizer: { select: { id: true, firstName: true, lastName: true } },
          participants: { select: { id: true, userId: true, rsvpStatus: true, role: true } },
        },
      }),
      this.prisma.scheduledEvent.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async addParticipant(eventId: string, participantDto: any, userId: string, tenantId: string) {
    await this.findEventOrThrow(eventId, tenantId);

    const participant = await this.prisma.eventParticipant.create({
      data: {
        tenantId, eventId,
        userId: participantDto.userId ?? null,
        email: participantDto.email ?? null,
        name: participantDto.name ?? null,
        role: participantDto.role ?? 'ATTENDEE',
        isExternal: !participantDto.userId,
      },
    });

    await this.prisma.eventHistory.create({
      data: { tenantId, eventId, action: 'PARTICIPANT_ADDED', newValue: participantDto.userId ?? participantDto.email, changedById: userId },
    });

    return participant;
  }

  async removeParticipant(eventId: string, participantUserId: string, userId: string, tenantId: string) {
    const event = await this.findEventOrThrow(eventId, tenantId);

    await this.prisma.eventParticipant.deleteMany({
      where: { eventId, userId: participantUserId },
    });

    await this.prisma.eventHistory.create({
      data: { tenantId, eventId, action: 'PARTICIPANT_REMOVED', newValue: participantUserId, changedById: userId },
    });
  }

  async updateRSVP(eventId: string, userId: string, rsvpStatus: string, tenantId: string) {
    const participant = await this.prisma.eventParticipant.findFirst({
      where: { eventId, userId, tenantId },
    });
    if (!participant) throw new NotFoundException('You are not a participant of this event');

    return this.prisma.eventParticipant.update({
      where: { id: participant.id },
      data: { rsvpStatus: rsvpStatus as any, rsvpAt: new Date() },
    });
  }

  async getEventHistory(eventId: string, tenantId: string) {
    return this.prisma.eventHistory.findMany({
      where: { eventId, tenantId },
      include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findEventOrThrow(id: string, tenantId: string) {
    const event = await this.prisma.scheduledEvent.findFirst({ where: { id, tenantId } });
    if (!event) throw new NotFoundException('Scheduled event not found');
    return event;
  }

  private validateOwnership(event: any, userId: string) {
    if (event.organizerId !== userId && event.createdById !== userId) {
      throw new ForbiddenException('Only the organizer can modify this event');
    }
  }
}
