import { TransferOwnerHandler } from '../../application/commands/transfer-owner/transfer-owner.handler';
import { OwnershipCoreService } from '../../services/ownership-core.service';
import { NotFoundException } from '@nestjs/common';

describe('TransferOwnerHandler', () => {
  let handler: TransferOwnerHandler;
  let prisma: any;
  let ownershipCore: OwnershipCoreService;

  beforeEach(() => {
    prisma = {
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1' }), update: jest.fn().mockResolvedValue({}) },
      contact: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
      quotation: { findUnique: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-2', firstName: 'Priya', lastName: 'Sharma', status: 'ACTIVE' }) },
      entityOwner: {
        findFirst: jest.fn().mockResolvedValue({ id: 'eo-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER', isActive: true }),
        create: jest.fn().mockResolvedValue({ id: 'eo-2', userId: 'u-2', ownerType: 'PRIMARY_OWNER', isActive: true, user: { id: 'u-2', firstName: 'Priya', lastName: 'Sharma', email: 'priya@test.com', avatar: null } }),
        update: jest.fn().mockResolvedValue({}),
      },
      ownershipLog: { create: jest.fn().mockResolvedValue({}) },
      userCapacity: { findUnique: jest.fn().mockResolvedValue({ activeLeads: 5, activeTotal: 20 }), upsert: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) },
    };
(prisma as any).working = prisma;
    ownershipCore = new OwnershipCoreService(prisma);
    handler = new TransferOwnerHandler(ownershipCore);
  });

  it('should transfer ownership and deactivate old record', async () => {
    await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', fromUserId: 'u-1', toUserId: 'u-2',
      ownerType: 'PRIMARY_OWNER', transferredById: 'u-admin', reason: 'TEAM_RESTRUCTURE',
    } as any);
    expect(prisma.entityOwner.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'eo-1' }, data: expect.objectContaining({ isActive: false }) }),
    );
    expect(prisma.entityOwner.create).toHaveBeenCalled();
  });

  it('should create OwnershipLog with fromUser and toUser', async () => {
    await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', fromUserId: 'u-1', toUserId: 'u-2',
      ownerType: 'PRIMARY_OWNER', transferredById: 'u-admin', reason: 'TEAM_RESTRUCTURE',
    } as any);
    expect(prisma.ownershipLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'TRANSFER', fromUserId: 'u-1', toUserId: 'u-2' }) }),
    );
  });

  it('should update UserCapacity counts for both users', async () => {
    await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', fromUserId: 'u-1', toUserId: 'u-2',
      ownerType: 'PRIMARY_OWNER', transferredById: 'u-admin', reason: 'TEAM_RESTRUCTURE',
    } as any);
    expect(prisma.userCapacity.update).toHaveBeenCalled();
    expect(prisma.userCapacity.upsert).toHaveBeenCalled();
  });

  it('should fail if no active ownership to transfer', async () => {
    prisma.entityOwner.findFirst.mockResolvedValue(null);
    await expect(handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', fromUserId: 'u-1', toUserId: 'u-2',
      ownerType: 'PRIMARY_OWNER', transferredById: 'u-admin', reason: 'TEST',
    } as any)).rejects.toThrow(NotFoundException);
  });

  it('should work for CONTACT entity type', async () => {
    prisma.contact.findUnique = jest.fn().mockResolvedValue({ id: 'c-1' });
    prisma.entityOwner.findFirst.mockResolvedValue({ id: 'eo-c', userId: 'u-1', ownerType: 'PRIMARY_OWNER', isActive: true });
    await handler.execute({
      entityType: 'CONTACT', entityId: 'c-1', fromUserId: 'u-1', toUserId: 'u-2',
      ownerType: 'PRIMARY_OWNER', transferredById: 'u-admin', reason: 'TEST',
    } as any);
    expect(prisma.entityOwner.create).toHaveBeenCalled();
  });
});
