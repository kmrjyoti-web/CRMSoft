import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OwnershipCoreService } from '../services/ownership-core.service';

const makeOwner = (overrides = {}) => ({
  id: 'eo-1',
  entityType: 'LEAD',
  entityId: 'lead-1',
  userId: 'user-1',
  ownerType: 'PRIMARY_OWNER',
  isActive: true,
  assignedById: 'admin-1',
  reason: 'MANUAL',
  assignedAt: new Date(),
  ...overrides,
});

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  isActive: true,
  status: 'ACTIVE',
  firstName: 'Rahul',
  lastName: 'Sharma',
  ...overrides,
});

describe('OwnershipCoreService', () => {
  let service: OwnershipCoreService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      userCapacity: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      working: {
        entityOwner: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          updateMany: jest.fn(),
          count: jest.fn(),
        },
        ownershipLog: {
          create: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
          findFirst: jest.fn(),
        },
        userCapacity: {
          upsert: jest.fn(),
          update: jest.fn(),
        },
        lead: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
        contact: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
        organization: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
        quotation: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
      },
    };
    // default: return an active user for any id lookup (logging calls)
    prisma.user.findUnique.mockResolvedValue(makeUser());
    const resolver = { resolveUsers: jest.fn().mockImplementation((r: any) => Promise.resolve(r)), resolveUser: jest.fn().mockResolvedValue(null) } as any;
    service = new OwnershipCoreService(prisma, resolver);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── assign ───────────────────────────────────────────────────────────────

  describe('assign', () => {
    it('should assign a primary owner to a lead', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.working.entityOwner.findFirst.mockResolvedValue(null); // no existing
      prisma.working.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      prisma.working.entityOwner.create.mockResolvedValue(makeOwner());
      prisma.working.ownershipLog.create.mockResolvedValue({});
      prisma.working.userCapacity.upsert?.mockResolvedValue({});

      const result = await service.assign({
        entityType: 'LEAD',
        entityId: 'lead-1',
        userId: 'user-1',
        ownerType: 'PRIMARY_OWNER',
        assignedById: 'admin-1',
        reason: 'MANUAL',
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when user not found', async () => {
      prisma.working.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.assign({
        entityType: 'LEAD',
        entityId: 'lead-1',
        userId: 'unknown',
        ownerType: 'PRIMARY_OWNER',
        assignedById: 'admin-1',
        reason: 'MANUAL',
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is inactive', async () => {
      prisma.working.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      prisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false, status: 'INACTIVE' }));
      await expect(service.assign({
        entityType: 'LEAD',
        entityId: 'lead-1',
        userId: 'user-inactive',
        ownerType: 'PRIMARY_OWNER',
        assignedById: 'admin-1',
        reason: 'MANUAL',
      })).rejects.toThrow(BadRequestException);
    });
  });

  // ─── transfer ─────────────────────────────────────────────────────────────

  describe('transfer', () => {
    it('should throw NotFoundException when no active ownership found', async () => {
      prisma.working.entityOwner.findFirst.mockResolvedValue(null);
      await expect(service.transfer({
        entityType: 'LEAD',
        entityId: 'lead-1',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        ownerType: 'PRIMARY_OWNER',
        transferredById: 'admin-1',
        reason: 'REASSIGNMENT',
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when target user is inactive', async () => {
      prisma.working.entityOwner.findFirst.mockResolvedValue(makeOwner());
      prisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false, status: 'INACTIVE' }));
      await expect(service.transfer({
        entityType: 'LEAD',
        entityId: 'lead-1',
        fromUserId: 'user-1',
        toUserId: 'user-inactive',
        ownerType: 'PRIMARY_OWNER',
        transferredById: 'admin-1',
        reason: 'REASSIGNMENT',
      })).rejects.toThrow(BadRequestException);
    });

    it('should transfer ownership to an active user', async () => {
      prisma.working.entityOwner.findFirst.mockResolvedValue(makeOwner());
      prisma.user.findUnique.mockResolvedValue(makeUser({ id: 'user-2' }));
      prisma.working.entityOwner.update.mockResolvedValue(makeOwner({ isActive: false }));
      prisma.working.entityOwner.create.mockResolvedValue(makeOwner({ userId: 'user-2' }));
      prisma.working.ownershipLog.create.mockResolvedValue({});
      prisma.working.userCapacity.upsert?.mockResolvedValue({});
      prisma.working.userCapacity.update?.mockResolvedValue({});

      const result = await service.transfer({
        entityType: 'LEAD',
        entityId: 'lead-1',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        ownerType: 'PRIMARY_OWNER',
        transferredById: 'admin-1',
        reason: 'REASSIGNMENT',
      });
      expect(result).toBeDefined();
    });
  });

  // ─── revoke ───────────────────────────────────────────────────────────────

  describe('revoke', () => {
    it('should throw NotFoundException when no active ownership to revoke', async () => {
      prisma.working.entityOwner.findFirst.mockResolvedValue(null);
      await expect(service.revoke({
        entityType: 'LEAD',
        entityId: 'lead-1',
        userId: 'user-1',
        ownerType: 'PRIMARY_OWNER',
        revokedById: 'admin-1',
        reason: 'REVOCATION',
      })).rejects.toThrow(NotFoundException);
    });

    it('should revoke active ownership', async () => {
      prisma.working.entityOwner.findFirst.mockResolvedValue(makeOwner());
      prisma.working.entityOwner.update.mockResolvedValue(makeOwner({ isActive: false }));
      prisma.working.ownershipLog.create.mockResolvedValue({});
      prisma.working.userCapacity.update?.mockResolvedValue({});
      await service.revoke({
        entityType: 'LEAD',
        entityId: 'lead-1',
        userId: 'user-1',
        ownerType: 'PRIMARY_OWNER',
        revokedById: 'admin-1',
        reason: 'REVOCATION',
      });
      expect(prisma.working.entityOwner.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isActive: false }) }),
      );
    });
  });

  // ─── getEntityOwners ──────────────────────────────────────────────────────

  describe('getEntityOwners', () => {
    it('should return all owners for an entity', async () => {
      prisma.working.entityOwner.findMany.mockResolvedValue([makeOwner()]);
      const result = await service.getEntityOwners('LEAD', 'lead-1');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].entityType).toBe('LEAD');
    });

    it('should return empty array when entity has no owners', async () => {
      prisma.working.entityOwner.findMany.mockResolvedValue([]);
      const result = await service.getEntityOwners('LEAD', 'lead-999');
      expect(result).toEqual([]);
    });
  });

  // ─── validateEntity ───────────────────────────────────────────────────────

  describe('validateEntity', () => {
    it('should throw BadRequestException for unsupported entity type', async () => {
      await expect(service.validateEntity('INVALID_TYPE', 'any-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      prisma.working.lead.findUnique.mockResolvedValue(null);
      await expect(service.validateEntity('LEAD', 'missing-id')).rejects.toThrow(NotFoundException);
    });

    it('should return true when LEAD entity exists', async () => {
      prisma.working.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
      const result = await service.validateEntity('LEAD', 'lead-1');
      expect(result).toBe(true);
    });
  });
});
