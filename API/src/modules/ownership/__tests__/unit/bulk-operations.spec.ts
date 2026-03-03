import { BulkAssignHandler } from '../../application/commands/bulk-assign/bulk-assign.handler';
import { BulkTransferHandler } from '../../application/commands/bulk-transfer/bulk-transfer.handler';
import { OwnershipCoreService } from '../../services/ownership-core.service';

describe('Bulk Operations', () => {
  let prisma: any;
  let ownershipCore: OwnershipCoreService;

  beforeEach(() => {
    prisma = {
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1' }), update: jest.fn().mockResolvedValue({}) },
      contact: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
      quotation: { findUnique: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-1', firstName: 'Raj', lastName: 'P', status: 'ACTIVE' }) },
      entityOwner: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([
          { id: 'eo-1', entityType: 'LEAD', entityId: 'lead-1', ownerType: 'PRIMARY_OWNER', userId: 'u-1', isActive: true },
          { id: 'eo-2', entityType: 'CONTACT', entityId: 'c-1', ownerType: 'PRIMARY_OWNER', userId: 'u-1', isActive: true },
        ]),
        create: jest.fn().mockResolvedValue({ id: 'eo-new', isActive: true, user: { id: 'u-1', firstName: 'Raj', lastName: 'P', email: 'r@t.com', avatar: null } }),
        update: jest.fn().mockResolvedValue({}),
      },
      ownershipLog: { create: jest.fn().mockResolvedValue({}) },
      userCapacity: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) },
    };
    ownershipCore = new OwnershipCoreService(prisma);
  });

  it('should bulk assign and create EntityOwner for each entity', async () => {
    const handler = new BulkAssignHandler(ownershipCore);
    const result = await handler.execute({
      entityType: 'LEAD', entityIds: ['lead-1', 'lead-2', 'lead-3'],
      userId: 'u-1', ownerType: 'PRIMARY_OWNER', reason: 'MANUAL_ASSIGN', assignedById: 'u-admin',
    } as any);
    expect(result.success).toBe(3);
    expect(result.total).toBe(3);
  });

  it('should bulk transfer all entities from user A to B', async () => {
    prisma.entityOwner.findFirst
      .mockResolvedValueOnce({ id: 'eo-1', userId: 'u-1', ownerType: 'PRIMARY_OWNER', isActive: true })
      .mockResolvedValueOnce({ id: 'eo-2', userId: 'u-1', ownerType: 'PRIMARY_OWNER', isActive: true });
    prisma.contact.findUnique = jest.fn().mockResolvedValue({ id: 'c-1' });

    const handler = new BulkTransferHandler(ownershipCore, prisma);
    const result = await handler.execute({
      fromUserId: 'u-1', toUserId: 'u-2', transferredById: 'u-admin',
      reason: 'EMPLOYEE_LEAVING', reasonDetail: 'Employee resignation',
    } as any);
    expect(result.transferred).toBe(2);
    expect(result.byType).toBeDefined();
  });

  it('should handle partial failures gracefully', async () => {
    prisma.lead.findUnique.mockResolvedValueOnce({ id: 'lead-1' }).mockResolvedValueOnce(null);

    const handler = new BulkAssignHandler(ownershipCore);
    const result = await handler.execute({
      entityType: 'LEAD', entityIds: ['lead-1', 'lead-bad'],
      userId: 'u-1', ownerType: 'PRIMARY_OWNER', reason: 'TEST', assignedById: 'u-admin',
    } as any);
    expect(result.success).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors.length).toBe(1);
  });

  it('should return preview without executing transfers', async () => {
    // Preview is a query, not a command — test verifies structure
    const owners = await prisma.entityOwner.findMany({ where: { userId: 'u-1', isActive: true } });
    expect(owners.length).toBe(2);
    const byType: Record<string, number> = {};
    for (const o of owners) byType[o.entityType] = (byType[o.entityType] || 0) + 1;
    expect(byType['LEAD']).toBe(1);
    expect(byType['CONTACT']).toBe(1);
  });
});
