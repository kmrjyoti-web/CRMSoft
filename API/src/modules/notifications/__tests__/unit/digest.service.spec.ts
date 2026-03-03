import { DigestService } from '../../services/digest.service';

describe('DigestService', () => {
  let service: DigestService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notificationPreference: {
        findMany: jest.fn().mockResolvedValue([
          { userId: 'u-1', digestFrequency: 'HOURLY', isActive: true },
          { userId: 'u-2', digestFrequency: 'HOURLY', isActive: true },
        ]),
      },
      notification: {
        count: jest.fn().mockResolvedValue(5),
        findMany: jest.fn().mockResolvedValue([
          { id: 'n-1', category: 'LEAD_ASSIGNED', priority: 'HIGH' },
          { id: 'n-2', category: 'LEAD_ASSIGNED', priority: 'MEDIUM' },
          { id: 'n-3', category: 'DEMO_SCHEDULED', priority: 'LOW' },
        ]),
        groupBy: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    service = new DigestService(prisma);
  });

  it('should process hourly digest for subscribed users', async () => {
    await service.processHourlyDigest();
    expect(prisma.notificationPreference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ digestFrequency: 'HOURLY' }) }),
    );
    expect(prisma.notification.count).toHaveBeenCalledTimes(2); // once per user
  });

  it('should skip users with zero unread notifications', async () => {
    prisma.notification.count.mockResolvedValue(0);
    await service.processHourlyDigest();
    expect(prisma.notification.findMany).not.toHaveBeenCalled();
  });

  it('should regroup notifications with same groupKey', async () => {
    prisma.notification.groupBy.mockResolvedValue([
      { recipientId: 'u-1', groupKey: 'lead-updates', _count: 3 },
    ]);
    prisma.notification.findMany.mockResolvedValue([
      { id: 'n-1', recipientId: 'u-1', groupKey: 'lead-updates', status: 'UNREAD' },
      { id: 'n-2', recipientId: 'u-1', groupKey: 'lead-updates', status: 'UNREAD' },
      { id: 'n-3', recipientId: 'u-1', groupKey: 'lead-updates', status: 'UNREAD' },
    ]);

    await service.regroupNotifications();
    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'n-1' }, data: expect.objectContaining({ isGrouped: true, groupCount: 3 }) }),
    );
    expect(prisma.notification.updateMany).toHaveBeenCalled();
  });
});
