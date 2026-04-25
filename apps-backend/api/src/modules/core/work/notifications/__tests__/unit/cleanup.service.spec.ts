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

  describe('error cases', () => {
    it('should propagate DB error from notification.updateMany', async () => {
      prisma.notification.updateMany.mockRejectedValue(new Error('DB connection lost'));
      await expect(service.cleanupOldNotifications()).rejects.toThrow('DB connection lost');
    });

    it('should complete gracefully when both operations return zero count', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });
      await expect(service.cleanupOldNotifications()).resolves.toBeUndefined();
    });

    it('should only delete DISMISSED and ARCHIVED statuses, not UNREAD', async () => {
      await service.cleanupOldNotifications();
      const deleteCall = prisma.notification.deleteMany.mock.calls[0][0];
      expect(deleteCall.where.status.in).toContain('DISMISSED');
      expect(deleteCall.where.status.in).toContain('ARCHIVED');
      expect(deleteCall.where.status.in).not.toContain('UNREAD');
    });
  });
});
