import { NotFoundException } from '@nestjs/common';
import { QuietHourService } from '../../services/quiet-hour.service';

function makePrisma(overrides: Record<string, any> = {}) {
  const existing = 'existing' in overrides ? overrides.existing : { id: 'qh-1' };
  const prisma: any = {
    quietHourConfig: {
      create: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: 'qh-new', ...args.data })),
      findUnique: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockImplementation((args: any) => Promise.resolve({ id: args.where.id, ...args.data })),
      delete: jest.fn().mockResolvedValue({ id: 'qh-1' }),
      findMany: jest.fn().mockResolvedValue(overrides.configs ?? []),
    },
  };
  return { prisma, service: new QuietHourService(prisma) };
}

describe('QuietHourService', () => {
  describe('createConfig', () => {
    it('should create a quiet hour config with default timezone Asia/Kolkata', async () => {
      const { service, prisma } = makePrisma();

      const result = await service.createConfig({
        name: 'Night Hours',
        startTime: '22:00',
        endTime: '06:00',
        daysOfWeek: [1, 2, 3, 4, 5],
      }, 'tenant-1');

      expect(prisma.quietHourConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Night Hours',
            timezone: 'Asia/Kolkata',
            tenantId: 'tenant-1',
          }),
        }),
      );
      expect(result.id).toBe('qh-new');
    });

    it('should use provided timezone', async () => {
      const { service, prisma } = makePrisma();

      await service.createConfig({
        name: 'US Hours',
        startTime: '23:00',
        endTime: '07:00',
        daysOfWeek: [0, 6],
        timezone: 'America/New_York',
      });

      expect(prisma.quietHourConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ timezone: 'America/New_York' }),
        }),
      );
    });

    it('should default allowUrgent to true', async () => {
      const { service, prisma } = makePrisma();

      await service.createConfig({ name: 'DND', startTime: '22:00', endTime: '08:00', daysOfWeek: [1] });

      expect(prisma.quietHourConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ allowUrgent: true }),
        }),
      );
    });
  });

  describe('updateConfig', () => {
    it('should update an existing config', async () => {
      const { service, prisma } = makePrisma();

      const result = await service.updateConfig('qh-1', { name: 'Updated', isActive: false });

      expect(prisma.quietHourConfig.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'qh-1' },
          data: expect.objectContaining({ name: 'Updated', isActive: false }),
        }),
      );
      expect(result).toMatchObject({ id: 'qh-1' });
    });

    it('should throw NotFoundException when config not found', async () => {
      const { service } = makePrisma({ existing: null });

      await expect(service.updateConfig('missing', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should only pass defined fields to update', async () => {
      const { service, prisma } = makePrisma();

      await service.updateConfig('qh-1', { name: 'Only Name' });

      const updateCall = prisma.quietHourConfig.update.mock.calls[0][0];
      expect(updateCall.data).toHaveProperty('name', 'Only Name');
      expect(updateCall.data).not.toHaveProperty('startTime');
      expect(updateCall.data).not.toHaveProperty('isActive');
    });
  });

  describe('deleteConfig', () => {
    it('should delete an existing config', async () => {
      const { service, prisma } = makePrisma();

      const result = await service.deleteConfig('qh-1');

      expect(prisma.quietHourConfig.delete).toHaveBeenCalledWith({ where: { id: 'qh-1' } });
      expect(result).toMatchObject({ id: 'qh-1' });
    });

    it('should throw NotFoundException when config not found', async () => {
      const { service } = makePrisma({ existing: null });

      await expect(service.deleteConfig('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listConfigs', () => {
    it('should return all configs for a tenant', async () => {
      const configs = [{ id: 'qh-1' }, { id: 'qh-2' }];
      const { service, prisma } = makePrisma({ configs });

      const result = await service.listConfigs('tenant-1');

      expect(result).toHaveLength(2);
      expect(prisma.quietHourConfig.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('getConfigsForUser', () => {
    it('should fetch user-specific and global configs', async () => {
      const { service, prisma } = makePrisma({ configs: [] });

      await service.getConfigsForUser('user-1', 'tenant-1');

      expect(prisma.quietHourConfig.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: expect.arrayContaining([
              { userId: 'user-1' },
              { userId: null },
            ]),
          }),
        }),
      );
    });
  });

  describe('isInQuietHours', () => {
    it('should return false when no configs exist', async () => {
      const { service } = makePrisma({ configs: [] });

      const result = await service.isInQuietHours('user-1', 'tenant-1');

      expect(result).toBe(false);
    });
  });
});
