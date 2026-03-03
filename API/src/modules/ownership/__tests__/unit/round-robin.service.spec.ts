import { RoundRobinService } from '../../services/round-robin.service';
import { BadRequestException } from '@nestjs/common';

describe('RoundRobinService', () => {
  let service: RoundRobinService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      userCapacity: { findUnique: jest.fn() },
      assignmentRule: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
    };
    service = new RoundRobinService(prisma);
  });

  it('should return next user in circular order', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u-2', status: 'ACTIVE' });
    prisma.userCapacity.findUnique.mockResolvedValue({ isAvailable: true });

    const result = await service.getNextUser({
      userIds: ['u-1', 'u-2', 'u-3'], entityType: 'LEAD', lastAssignedIndex: 0,
    });
    expect(result.userId).toBe('u-2');
    expect(result.newIndex).toBe(1);
  });

  it('should skip unavailable users', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'u-2', status: 'ACTIVE' })
      .mockResolvedValueOnce({ id: 'u-3', status: 'ACTIVE' });
    prisma.userCapacity.findUnique
      .mockResolvedValueOnce({ isAvailable: false })
      .mockResolvedValueOnce({ isAvailable: true });

    const result = await service.getNextUser({
      userIds: ['u-1', 'u-2', 'u-3'], entityType: 'LEAD', lastAssignedIndex: 0,
    });
    expect(result.userId).toBe('u-3');
    expect(result.newIndex).toBe(2);
  });

  it('should skip users at capacity when respectCapacity = true', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'u-2', status: 'ACTIVE' })
      .mockResolvedValueOnce({ id: 'u-3', status: 'ACTIVE' });
    prisma.userCapacity.findUnique
      .mockResolvedValueOnce({ isAvailable: true, activeLeads: 50, maxLeads: 50 })
      .mockResolvedValueOnce({ isAvailable: true, activeLeads: 10, maxLeads: 50 });

    const result = await service.getNextUser({
      userIds: ['u-1', 'u-2', 'u-3'], entityType: 'LEAD', lastAssignedIndex: 0,
      respectCapacity: true,
    });
    expect(result.userId).toBe('u-3');
  });

  it('should wrap around to beginning after last user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u-1', status: 'ACTIVE' });
    prisma.userCapacity.findUnique.mockResolvedValue({ isAvailable: true });

    const result = await service.getNextUser({
      userIds: ['u-1', 'u-2', 'u-3'], entityType: 'LEAD', lastAssignedIndex: 2,
    });
    expect(result.userId).toBe('u-1');
    expect(result.newIndex).toBe(0);
  });

  it('should throw error when all users are unavailable', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u-1', status: 'INACTIVE' });

    await expect(service.getNextUser({
      userIds: ['u-1', 'u-2'], entityType: 'LEAD', lastAssignedIndex: 0,
    })).rejects.toThrow(BadRequestException);
  });
});
