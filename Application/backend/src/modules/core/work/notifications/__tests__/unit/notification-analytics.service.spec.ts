import { NotificationAnalyticsService } from '../../services/notification-analytics.service';

function makeService(overrides: Record<string, any> = {}) {
  const prisma: any = {
    notification: {
      count: jest.fn().mockImplementation((args: any) => {
        if (args?.where?.deliveredAt) return Promise.resolve(overrides.deliveredCount ?? 80);
        if (args?.where?.readAt) return Promise.resolve(overrides.readCount ?? 60);
        if (args?.where?.failedAt) return Promise.resolve(overrides.failedCount ?? 10);
        return Promise.resolve(overrides.totalSent ?? 100);
      }),
      groupBy: jest.fn().mockResolvedValue(overrides.byEvent ?? [
        { eventType: 'LEAD_ASSIGNED', _count: { id: 40 } },
        { eventType: 'PAYMENT_DUE', _count: { id: 20 } },
      ]),
      findMany: jest.fn().mockResolvedValue(overrides.failedNotifications ?? [
        { failureReason: 'TIMEOUT' },
        { failureReason: 'TIMEOUT' },
        { failureReason: 'INVALID_TOKEN' },
      ]),
    },
    communicationLog: {
      groupBy: jest.fn().mockResolvedValue(overrides.byChannel ?? [
        { channel: 'EMAIL', _count: { id: 50 } },
        { channel: 'SMS', _count: { id: 30 } },
      ]),
    },
  };
  const service = new NotificationAnalyticsService(prisma);
  return { service, prisma };
}

const start = new Date('2026-01-01');
const end = new Date('2026-01-31');

describe('NotificationAnalyticsService', () => {
  it('should return correct delivery rate', async () => {
    const { service } = makeService({ totalSent: 100, deliveredCount: 80 });

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.totalSent).toBe(100);
    expect(result.deliveryRate).toBe(80);
  });

  it('should return correct read rate', async () => {
    const { service } = makeService({ totalSent: 100, readCount: 60 });

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.readRate).toBe(60);
  });

  it('should return correct failure rate', async () => {
    const { service } = makeService({ totalSent: 100, failedCount: 10 });

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.failureRate).toBe(10);
  });

  it('should return 0 rates when totalSent is 0', async () => {
    const { service } = makeService({
      totalSent: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
    });

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.deliveryRate).toBe(0);
    expect(result.readRate).toBe(0);
    expect(result.failureRate).toBe(0);
  });

  it('should return byChannel grouped data', async () => {
    const { service } = makeService();

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.byChannel).toEqual([
      { channel: 'EMAIL', count: 50 },
      { channel: 'SMS', count: 30 },
    ]);
  });

  it('should return byEvent grouped data', async () => {
    const { service } = makeService();

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.byEvent).toEqual([
      { eventType: 'LEAD_ASSIGNED', count: 40 },
      { eventType: 'PAYMENT_DUE', count: 20 },
    ]);
  });

  it('should aggregate and rank top failure reasons', async () => {
    const { service } = makeService({
      failedNotifications: [
        { failureReason: 'TIMEOUT' },
        { failureReason: 'TIMEOUT' },
        { failureReason: 'INVALID_TOKEN' },
      ],
    });

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.topFailureReasons[0]).toEqual({ reason: 'TIMEOUT', count: 2 });
    expect(result.topFailureReasons[1]).toEqual({ reason: 'INVALID_TOKEN', count: 1 });
  });

  it('should apply tenant isolation in date filter', async () => {
    const { service, prisma } = makeService();

    await service.getAnalytics('tenant-42', start, end);

    expect(prisma.notification.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-42' }),
      }),
    );
  });

  it('should handle null failureReason as Unknown', async () => {
    const { service } = makeService({
      failedNotifications: [{ failureReason: null }, { failureReason: null }],
    });

    const result = await service.getAnalytics('tenant-1', start, end);

    expect(result.topFailureReasons[0]).toEqual({ reason: 'Unknown', count: 2 });
  });
});
