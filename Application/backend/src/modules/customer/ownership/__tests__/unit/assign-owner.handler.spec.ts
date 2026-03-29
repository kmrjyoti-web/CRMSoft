import { AssignOwnerHandler } from '../../application/commands/assign-owner/assign-owner.handler';
import { OwnershipCoreService } from '../../services/ownership-core.service';
import { BadRequestException } from '@nestjs/common';

describe('AssignOwnerHandler', () => {
  let handler: AssignOwnerHandler;
  let prisma: any;
  let ownershipCore: OwnershipCoreService;

  beforeEach(() => {
    prisma = {
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1' }), update: jest.fn().mockResolvedValue({}) },
      contact: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
      quotation: { findUnique: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-1', firstName: 'Raj', lastName: 'Patel', status: 'ACTIVE' }) },
      entityOwner: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'eo-1', entityType: 'LEAD', entityId: 'lead-1', ownerType: 'PRIMARY_OWNER', userId: 'u-1', isActive: true, user: { id: 'u-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com', avatar: null } }),
        update: jest.fn().mockResolvedValue({}),
      },
      ownershipLog: { create: jest.fn().mockResolvedValue({}) },
      userCapacity: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn().mockResolvedValue({}) },
    };
(prisma as any).working = prisma;
    ownershipCore = new OwnershipCoreService(prisma);
    handler = new AssignOwnerHandler(ownershipCore);
  });

  it('should assign PRIMARY_OWNER and create EntityOwner + OwnershipLog', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER',
      assignedById: 'u-1', reason: 'MANUAL_ASSIGN',
    } as any);
    expect(prisma.entityOwner.create).toHaveBeenCalled();
    expect(prisma.ownershipLog.create).toHaveBeenCalled();
    expect(result!.ownerType).toBe('PRIMARY_OWNER');
  });

  it('should auto-transfer when assigning new PRIMARY_OWNER', async () => {
    prisma.entityOwner.findFirst.mockResolvedValueOnce({ id: 'eo-old', userId: 'u-old', ownerType: 'PRIMARY_OWNER', isActive: true });
    prisma.entityOwner.findFirst.mockResolvedValueOnce({ id: 'eo-old', userId: 'u-old', ownerType: 'PRIMARY_OWNER', isActive: true });
    prisma.user.findUnique.mockResolvedValue({ id: 'u-1', firstName: 'Raj', lastName: 'Patel', status: 'ACTIVE' });
    prisma.entityOwner.findFirst.mockResolvedValueOnce({ id: 'eo-new', userId: 'u-1', ownerType: 'PRIMARY_OWNER', isActive: true });

    await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER',
      assignedById: 'u-1', reason: 'MANUAL_ASSIGN',
    } as any);
    expect(prisma.entityOwner.update).toHaveBeenCalled();
  });

  it('should allow multiple CO_OWNERs on same entity', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', userId: 'u-1', ownerType: 'CO_OWNER',
      assignedById: 'u-2', reason: 'MANUAL_ASSIGN',
    } as any);
    expect(prisma.entityOwner.create).toHaveBeenCalled();
    expect(result!.isActive).toBe(true);
  });

  it('should prevent duplicate — same user same ownerType same entity', async () => {
    prisma.entityOwner.findFirst.mockResolvedValue({ id: 'eo-dup', userId: 'u-1', ownerType: 'CO_OWNER', isActive: true });
    await expect(handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', userId: 'u-1', ownerType: 'CO_OWNER',
      assignedById: 'u-2', reason: 'MANUAL_ASSIGN',
    } as any)).rejects.toThrow(BadRequestException);
  });

  it('should update Lead.allocatedToId when assigning lead owner', async () => {
    await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER',
      assignedById: 'u-1', reason: 'MANUAL_ASSIGN',
    } as any);
    expect(prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'lead-1' }, data: expect.objectContaining({ allocatedToId: 'u-1' }) }),
    );
  });
});
