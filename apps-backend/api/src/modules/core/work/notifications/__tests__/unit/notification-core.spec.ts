import { NotificationCoreService } from '../../services/notification-core.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationCoreService', () => {
  let service: NotificationCoreService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notification: {
        create: jest.fn().mockResolvedValue({ id: 'n-1', category: 'LEAD_ASSIGNED', title: 'Lead Assigned', status: 'UNREAD' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'n-1', recipientId: 'u-1', status: 'UNREAD', isActive: true }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'n-1', category: 'LEAD_ASSIGNED', title: 'Lead Assigned', status: 'UNREAD' },
          { id: 'n-2', category: 'DEMO_SCHEDULED', title: 'Demo Scheduled', status: 'UNREAD' },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'n-1', status: 'READ' }),
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
        count: jest.fn().mockResolvedValue(5),
        groupBy: jest.fn().mockResolvedValue([]),
      },
    };
    service = new NotificationCoreService(prisma);
  });

  it('should create a notification', async () => {
    const result = await service.create({
      category: 'LEAD_ASSIGNED', title: 'New Lead', message: 'Lead assigned to you',
      recipientId: 'u-1', senderId: 'u-2',
    });
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(result.id).toBe('n-1');
  });

  it('should merge into existing group when groupKey matches', async () => {
    prisma.notification.findFirst.mockResolvedValue({
      id: 'n-existing', recipientId: 'u-1', groupKey: 'lead-updates', status: 'UNREAD', isActive: true,
    });
    prisma.notification.update.mockResolvedValue({ id: 'n-existing', groupCount: 2, isGrouped: true });

    const result = await service.create({
      category: 'LEAD_UPDATED', title: 'Lead Update', message: 'Updated',
      recipientId: 'u-1', groupKey: 'lead-updates',
    });
    expect(prisma.notification.update).toHaveBeenCalled();
    expect(result.groupCount).toBe(2);
  });

  it('should mark notification as read', async () => {
    const result = await service.markRead('n-1', 'u-1');
    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'READ' }) }),
    );
  });

  it('should throw NotFoundException when marking non-existent notification', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    await expect(service.markRead('n-bad', 'u-1')).rejects.toThrow(NotFoundException);
  });

  it('should mark all as read with optional category filter', async () => {
    const result = await service.markAllRead('u-1', 'LEAD_ASSIGNED');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'u-1', category: 'LEAD_ASSIGNED' }),
      }),
    );
    expect(result.updated).toBe(3);
  });

  it('should dismiss a notification', async () => {
    prisma.notification.update.mockResolvedValue({ id: 'n-1', status: 'DISMISSED' });
    const result = await service.dismiss('n-1', 'u-1');
    expect(result.status).toBe('DISMISSED');
  });

  it('should bulk mark read', async () => {
    const result = await service.bulkMarkRead(['n-1', 'n-2', 'n-3'], 'u-1');
    expect(result.updated).toBe(3);
  });

  it('should get paginated notifications', async () => {
    prisma.notification.count.mockResolvedValue(2);
    const result = await service.getNotifications('u-1', { page: 1, limit: 20 });
    expect(result.data.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
  });

  it('should get unread count with category breakdown', async () => {
    prisma.notification.count.mockResolvedValue(10);
    prisma.notification.groupBy.mockResolvedValue([
      { category: 'LEAD_ASSIGNED', _count: 5 },
      { category: 'DEMO_SCHEDULED', _count: 3 },
    ]);
    const result = await service.getUnreadCount('u-1');
    expect(result.total).toBe(10);
    expect(result.byCategory['LEAD_ASSIGNED']).toBe(5);
  });
});
