import { PreferenceService } from '../../services/preference.service';
import { NotFoundException } from '@nestjs/common';

describe('PreferenceService', () => {
  let service: PreferenceService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notificationPreference: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          userId: 'u-1', channels: { enabled: ['IN_APP', 'EMAIL'] },
          categories: {}, digestFrequency: 'REALTIME', timezone: 'Asia/Kolkata',
        }),
        upsert: jest.fn().mockResolvedValue({
          userId: 'u-1', channels: { enabled: ['IN_APP'] },
          digestFrequency: 'DAILY',
        }),
      },
      pushSubscription: {
        create: jest.fn().mockResolvedValue({ id: 'ps-1', userId: 'u-1', endpoint: 'https://push.example.com' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new PreferenceService(prisma);
  });

  it('should create default preferences when none exist', async () => {
    const result = await service.getPreferences('u-1');
    expect(prisma.notificationPreference.create).toHaveBeenCalled();
    expect(result.digestFrequency).toBe('REALTIME');
  });

  it('should return existing preferences without creating', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      userId: 'u-1', digestFrequency: 'DAILY',
    });
    const result = await service.getPreferences('u-1');
    expect(prisma.notificationPreference.create).not.toHaveBeenCalled();
    expect(result.digestFrequency).toBe('DAILY');
  });

  it('should update preferences with upsert', async () => {
    const result = await service.updatePreferences('u-1', {
      digestFrequency: 'DAILY', quietHoursStart: '22:00', quietHoursEnd: '08:00',
    });
    expect(prisma.notificationPreference.upsert).toHaveBeenCalled();
  });

  it('should register push subscription', async () => {
    const result = await service.registerPushSubscription('u-1', {
      endpoint: 'https://push.example.com', p256dh: 'key1', auth: 'auth1',
    });
    expect(prisma.pushSubscription.create).toHaveBeenCalled();
    expect(result.endpoint).toBe('https://push.example.com');
  });

  it('should unregister push subscription', async () => {
    const result = await service.unregisterPushSubscription('u-1', 'https://push.example.com');
    expect(result.unregistered).toBe(1);
  });

  it('should throw NotFoundException when unregistering non-existent subscription', async () => {
    prisma.pushSubscription.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.unregisterPushSubscription('u-1', 'bad-endpoint')).rejects.toThrow(NotFoundException);
  });
});
