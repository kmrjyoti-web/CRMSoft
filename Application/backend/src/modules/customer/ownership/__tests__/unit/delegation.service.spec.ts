import { DelegationService } from '../../services/delegation.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DelegationService', () => {
  let service: DelegationService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-2', firstName: 'Priya', lastName: 'S', status: 'ACTIVE' }) },
      delegationRecord: {
        create: jest.fn().mockResolvedValue({ id: 'del-1', fromUserId: 'u-1', toUserId: 'u-2' }),
        findUnique: jest.fn().mockResolvedValue({ id: 'del-1', fromUserId: 'u-1', toUserId: 'u-2', isReverted: false, entityType: null }),
        update: jest.fn().mockResolvedValue({}),
      },
      entityOwner: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'eo-1', entityType: 'LEAD', entityId: 'lead-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER' },
          { id: 'eo-2', entityType: 'CONTACT', entityId: 'c-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER' },
        ]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      ownershipLog: { create: jest.fn().mockResolvedValue({}) },
      userCapacity: { upsert: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) },
    };
(prisma as any).working = prisma;
    service = new DelegationService(prisma);
  });

  it('should create DelegationRecord and DELEGATED_OWNER entries', async () => {
    const result = await service.delegate({
      fromUserId: 'u-1', toUserId: 'u-2', startDate: new Date(), endDate: new Date('2026-03-15'),
      reason: 'Annual Leave', delegatedById: 'u-admin',
    });
    expect(prisma.delegationRecord.create).toHaveBeenCalled();
    expect(prisma.entityOwner.create).toHaveBeenCalledTimes(2);
    expect(result.entitiesDelegated).toBe(2);
  });

  it('should keep original PRIMARY_OWNER active during delegation', async () => {
    await service.delegate({
      fromUserId: 'u-1', toUserId: 'u-2', startDate: new Date(), endDate: new Date('2026-03-15'),
      reason: 'Leave', delegatedById: 'u-admin',
    });
    // Original owners should NOT be deactivated — only delegated copies created
    expect(prisma.entityOwner.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false }) }),
    );
  });

  it('should revert delegation: deactivate DELEGATED_OWNER and mark reverted', async () => {
    prisma.entityOwner.findMany.mockResolvedValue([
      { id: 'eo-del-1', entityType: 'LEAD', entityId: 'lead-1', userId: 'u-2', ownerType: 'DELEGATED_OWNER', isActive: true },
    ]);
    const result = await service.revertDelegation('del-1', 'u-admin');
    expect(result.reverted).toBe(1);
    expect(prisma.entityOwner.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'eo-del-1' }, data: expect.objectContaining({ isActive: false }) }),
    );
    expect(prisma.delegationRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isReverted: true }) }),
    );
  });

  it('should throw if delegation already reverted', async () => {
    prisma.delegationRecord.findUnique.mockResolvedValue({ id: 'del-1', isReverted: true });
    await expect(service.revertDelegation('del-1', 'u-admin')).rejects.toThrow(BadRequestException);
  });

  it('should set user unavailable during delegation period', async () => {
    await service.delegate({
      fromUserId: 'u-1', toUserId: 'u-2', startDate: new Date(), endDate: new Date('2026-03-15'),
      reason: 'Medical Leave', delegatedById: 'u-admin',
    });
    expect(prisma.userCapacity.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u-1' }, update: expect.objectContaining({ isAvailable: false }) }),
    );
  });
});
