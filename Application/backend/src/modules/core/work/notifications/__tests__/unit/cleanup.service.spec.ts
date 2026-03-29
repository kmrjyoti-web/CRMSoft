import { CleanupService } from '../../services/cleanup.service';

describe('CleanupService', () => {
  let service: CleanupService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notification: {
        updateMany: jest.fn().mockResolvedValue({ count: 15 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
      },
      pushSubscription: {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    service = new CleanupService(prisma);
  });

  it('should archive read notifications older than 30 days', async () => {
    await service.cleanupOldNotifications();
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'READ' }),
        data: expect.objectContaining({ status: 'ARCHIVED', isActive: false }),
      }),
    );
  });

  it('should delete dismissed/archived notifications older than 90 days', async () => {
    await service.cleanupOldNotifications();
    expect(prisma.notification.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ['DISMISSED', 'ARCHIVED'] } }),
      }),
    );
  });

  it('should cleanup inactive push subscriptions weekly', async () => {
    await service.cleanupInactivePushSubscriptions();
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      }),
    );
  });
});
