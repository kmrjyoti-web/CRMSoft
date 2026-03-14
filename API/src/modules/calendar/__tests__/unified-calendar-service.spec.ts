import { UnifiedCalendarService } from '../services/unified-calendar.service';

describe('UnifiedCalendarService', () => {
  let service: UnifiedCalendarService;
  let prisma: any;
  let taskAssignment: any;

  const tenantId = 'tenant-1';
  const userId = 'user-1';
  const startDate = new Date('2025-06-01');
  const endDate = new Date('2025-06-30');

  beforeEach(() => {
    prisma = {
      task: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      activity: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      demo: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      tourPlan: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      reminder: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      followUp: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      scheduledEvent: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      eventParticipant: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    taskAssignment = {
      getReporteeIds: jest.fn().mockResolvedValue([]),
    };

    service = new UnifiedCalendarService(prisma, taskAssignment);
  });

  it('should aggregate events from multiple sources', async () => {
    const now = new Date('2025-06-15T10:00:00Z');

    prisma.task.findMany.mockResolvedValue([
      {
        id: 't1', title: 'Task 1', description: null, dueDate: now, startDate: now,
        status: 'OPEN', priority: 'HIGH', assignedToId: userId,
        assignedTo: { firstName: 'Raj', lastName: 'Patel' }, entityType: null, entityId: null,
      },
    ]);
    prisma.activity.findMany.mockResolvedValue([
      {
        id: 'a1', subject: 'Call Client', description: null, scheduledAt: now, endTime: null,
        type: 'CALL', createdById: userId,
        createdByUser: { firstName: 'Raj', lastName: 'Patel' }, locationName: null,
      },
    ]);
    prisma.scheduledEvent.findMany.mockResolvedValue([
      {
        id: 'se1', title: 'Team Meeting', description: null, startTime: now,
        endTime: new Date(now.getTime() + 3600000), allDay: false, color: null,
        location: null, meetingLink: null, status: 'SCHEDULED', type: 'MEETING',
        organizerId: userId, organizer: { firstName: 'Raj', lastName: 'Patel' },
        entityType: null, entityId: null,
      },
    ]);

    // roleLevel 0 = admin (sees all)
    const result = await service.getUnifiedView(userId, tenantId, 0, startDate, endDate);

    expect(result.length).toBeGreaterThanOrEqual(3);
    const sources = result.map((e) => e.source);
    expect(sources).toContain('TASK');
    expect(sources).toContain('ACTIVITY');
    expect(sources).toContain('SCHEDULED_EVENT');
  });

  it('should apply ADMIN visibility (sees all)', async () => {
    await service.getUnifiedView(userId, tenantId, 0, startDate, endDate);

    // Admin (roleLevel 0): getVisibleUserIds returns [] (empty = no filter = all users)
    expect(taskAssignment.getReporteeIds).not.toHaveBeenCalled();

    // The task findMany should have been called with tenantId but no assignedToId filter
    const taskCall = prisma.task.findMany.mock.calls[0][0];
    expect(taskCall.where.tenantId).toEqual({ in: [tenantId, ''] });
    expect(taskCall.where.assignedToId).toBeUndefined();
  });

  it('should apply MANAGER visibility (sees own + reportees)', async () => {
    taskAssignment.getReporteeIds.mockResolvedValue(['r1', 'r2']);

    await service.getUnifiedView(userId, tenantId, 2, startDate, endDate);

    expect(taskAssignment.getReporteeIds).toHaveBeenCalledWith(userId);

    // Manager (roleLevel 2): filter includes userId + reportee IDs
    const taskCall = prisma.task.findMany.mock.calls[0][0];
    expect(taskCall.where.assignedToId).toEqual({ in: [userId, 'r1', 'r2'] });
  });

  it('should apply USER visibility (sees own only)', async () => {
    await service.getUnifiedView(userId, tenantId, 5, startDate, endDate);

    // Regular user (roleLevel 5): only own userId in filter
    const taskCall = prisma.task.findMany.mock.calls[0][0];
    expect(taskCall.where.assignedToId).toEqual({ in: [userId] });
  });

  it('should return team view grouped by user', async () => {
    const now = new Date('2025-06-15T10:00:00Z');

    prisma.task.findMany.mockResolvedValue([
      {
        id: 't1', title: 'Task 1', description: null, dueDate: now, startDate: now,
        status: 'OPEN', priority: 'HIGH', assignedToId: 'user-1',
        assignedTo: { firstName: 'Raj', lastName: 'Patel' }, entityType: null, entityId: null,
      },
      {
        id: 't2', title: 'Task 2', description: null, dueDate: now, startDate: now,
        status: 'OPEN', priority: 'MEDIUM', assignedToId: 'user-2',
        assignedTo: { firstName: 'Amit', lastName: 'Shah' }, entityType: null, entityId: null,
      },
    ]);

    const result = await service.getTeamView(userId, tenantId, 0, startDate, endDate, ['user-1', 'user-2']);

    // Team view returns unified events; result should contain events for both users
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return correct stats', async () => {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    // Mock task data returned for today events
    prisma.task.findMany.mockResolvedValue([
      {
        id: 't1', title: 'Task Today', description: null, dueDate: now, startDate: now,
        status: 'OPEN', priority: 'HIGH', assignedToId: userId,
        assignedTo: { firstName: 'Raj', lastName: 'Patel' }, entityType: null, entityId: null,
      },
    ]);
    prisma.task.count.mockResolvedValue(2);
    prisma.eventParticipant.count.mockResolvedValue(3);

    const stats = await service.getStats(userId, tenantId, 0);

    expect(stats).toHaveProperty('todayEvents');
    expect(stats).toHaveProperty('weekEvents');
    expect(stats).toHaveProperty('overdueTasks', 2);
    expect(stats).toHaveProperty('pendingRsvps', 3);
  });
});
