import { SyncAnalyticsService } from '../services/sync-analytics.service';

function makeMockPrisma(overrides: any = {}) {
  return {
    syncDevice: {
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn().mockResolvedValue([
        { pendingUploadCount: 5 },
        { pendingUploadCount: 15 },
      ]),
    },
    syncConflict: {
      count: jest.fn().mockResolvedValue(3),
      groupBy: jest.fn().mockResolvedValue([
        { entityName: 'Lead', _count: { id: 5 } },
        { entityName: 'Contact', _count: { id: 2 } },
      ]),
    },
    syncFlushCommand: {
      count: jest.fn().mockResolvedValue(2),
    },
    syncAuditLog: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    ...overrides,
  } as any;
}

describe('SyncAnalyticsService', () => {
  it('getDashboard aggregates device and conflict counts', async () => {
    const prisma = makeMockPrisma();
    const service = new SyncAnalyticsService(prisma);

    const dashboard = await service.getDashboard();

    expect(dashboard.totalDevices).toBe(10);
    expect(dashboard.avgPendingUploads).toBe(10); // (5+15)/2
    expect(dashboard.entitiesWithMostConflicts).toHaveLength(2);
    expect(dashboard.entitiesWithMostConflicts[0].entityName).toBe('Lead');
  });

  it('getAuditLog returns paginated results', async () => {
    const auditLogs = [
      { id: 'log-1', action: 'PULL', entityName: 'Lead', recordsPulled: 50 },
      { id: 'log-2', action: 'PUSH', entityName: 'Contact', recordsPushed: 10 },
    ];

    const prisma = makeMockPrisma({
      syncAuditLog: {
        findMany: jest.fn().mockResolvedValue(auditLogs),
        count: jest.fn().mockResolvedValue(2),
      },
    });
    const service = new SyncAnalyticsService(prisma);

    const result = await service.getAuditLog({
      userId: 'user-1',
      action: 'PULL',
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(prisma.syncAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1', action: 'PULL' }),
      }),
    );
  });

  it('getAnalytics calculates sync metrics', async () => {
    const pullLogs = [
      { durationMs: 200, recordsPulled: 100, entityName: 'Lead' },
      { durationMs: 300, recordsPulled: 50, entityName: 'Lead' },
      { durationMs: 150, recordsPulled: 30, entityName: 'Contact' },
    ];
    const pushLogs = [
      { durationMs: 100, recordsPushed: 20, conflictsDetected: 2 },
      { durationMs: 80, recordsPushed: 10, conflictsDetected: 0 },
    ];

    const prisma = makeMockPrisma({
      syncAuditLog: {
        findMany: jest.fn()
          .mockResolvedValueOnce(pullLogs)
          .mockResolvedValueOnce(pushLogs),
      },
      syncConflict: {
        count: jest.fn().mockResolvedValue(5),
      },
    });
    const service = new SyncAnalyticsService(prisma);

    const analytics = await service.getAnalytics();

    expect(analytics.totalPulls).toBe(3);
    expect(analytics.totalPushes).toBe(2);
    expect(analytics.totalRecordsPulled).toBe(180);
    expect(analytics.totalRecordsPushed).toBe(30);
    expect(analytics.avgPullDurationMs).toBe(217); // (200+300+150)/3 rounded
    expect(analytics.avgPushDurationMs).toBe(90); // (100+80)/2
    expect(analytics.totalConflicts).toBe(5);
    expect(analytics.conflictRate).toBe(1); // (2+0)/2
    expect(analytics.topEntitiesBySync[0].entityName).toBe('Lead');
  });
});
