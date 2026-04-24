import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CustomerPortalService, PORTAL_DEFAULT_ROUTES } from '../customer-portal.service';

// ── Prisma mock helpers ────────────────────────────────────────────────────

const mockMenuCategory = {
  id: 'cat-1', tenantId: 'tenant-1', name: 'Standard Portal',
  description: 'Standard access', icon: 'layout-dashboard', color: '#2563eb',
  enabledRoutes: ['dashboard', 'orders', 'invoices'],
  isDefault: true, isActive: true, isDeleted: false, sortOrder: 0,
  createdAt: new Date(), updatedAt: new Date(), createdById: 'admin-1',
};

const mockCustomerUser = {
  id: 'cu-1', tenantId: 'tenant-1',
  email: 'customer@example.com', passwordHash: '$2a$12$hash',
  linkedEntityType: 'CONTACT', linkedEntityId: 'contact-1', linkedEntityName: 'John Doe',
  displayName: 'John Doe',
  menuCategoryId: 'cat-1', menuCategory: mockMenuCategory,
  pageOverrides: {},
  isActive: true, isFirstLogin: false,
  lastLoginAt: new Date(), loginCount: 5, failedAttempts: 0, lockedUntil: null,
  refreshToken: null, passwordResetToken: null, passwordResetExp: null,
  isDeleted: false, createdAt: new Date(), updatedAt: new Date(), createdById: 'admin-1',
};

const identityMock = {
  customerUser: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  customerMenuCategory: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  customerPortalLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const workingMock = {
  contact: { findMany: jest.fn() },
  organization: { findMany: jest.fn() },
};

const prismaMock = {
  identity: identityMock,
  getWorkingClient: jest.fn().mockResolvedValue(workingMock),
};

const jwtMock = { signAsync: jest.fn().mockResolvedValue('mock-token') };
const configMock = { get: jest.fn().mockReturnValue('test-secret') };

// ── Build service directly ────────────────────────────────────────────────

function buildService() {
  const svc = new CustomerPortalService(
    prismaMock as any,
    jwtMock as any,
    configMock as any,
  );
  return svc;
}

// ── Test Suite ────────────────────────────────────────────────────────────

describe('CustomerPortalService', () => {
  let service: CustomerPortalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = buildService();
  });

  // ── PORTAL_DEFAULT_ROUTES ────────────────────────────────────────────────

  it('exports PORTAL_DEFAULT_ROUTES with at least 5 routes', () => {
    expect(PORTAL_DEFAULT_ROUTES.length).toBeGreaterThanOrEqual(5);
    expect(PORTAL_DEFAULT_ROUTES[0]).toHaveProperty('key');
    expect(PORTAL_DEFAULT_ROUTES[0]).toHaveProperty('path');
  });

  // ── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      identityMock.customerUser.findFirst.mockResolvedValue(null);
      await expect(service.login('tenant-1', { email: 'x@x.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account disabled', async () => {
      identityMock.customerUser.findFirst.mockResolvedValue({ ...mockCustomerUser, isActive: false });
      await expect(service.login('tenant-1', { email: 'x@x.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for locked account', async () => {
      const locked = { ...mockCustomerUser, lockedUntil: new Date(Date.now() + 60000) };
      identityMock.customerUser.findFirst.mockResolvedValue(locked);
      await expect(service.login('tenant-1', { email: 'x@x.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ── createCategory ───────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('throws ConflictException if name already exists', async () => {
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(mockMenuCategory);
      await expect(service.createCategory('tenant-1', 'admin-1', { name: 'Standard Portal' }))
        .rejects.toThrow(ConflictException);
    });

    it('creates a category when name is unique', async () => {
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(null);
      identityMock.customerMenuCategory.updateMany.mockResolvedValue({ count: 0 });
      identityMock.customerMenuCategory.create.mockResolvedValue(mockMenuCategory);

      const result = await service.createCategory('tenant-1', 'admin-1', { name: 'New Cat', isDefault: true });
      expect(identityMock.customerMenuCategory.create).toHaveBeenCalled();
      expect(result).toMatchObject({ name: 'Standard Portal' });
    });
  });

  // ── activatePortal ───────────────────────────────────────────────────────

  describe('activatePortal', () => {
    it('throws ConflictException if entity already activated', async () => {
      identityMock.customerUser.findFirst.mockResolvedValueOnce(mockCustomerUser);
      await expect(service.activatePortal('tenant-1', 'admin-1', {
        linkedEntityType: 'CONTACT', linkedEntityId: 'contact-1',
        linkedEntityName: 'John', email: 'j@j.com',
      })).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if email already used', async () => {
      identityMock.customerUser.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCustomerUser);
      await expect(service.activatePortal('tenant-1', 'admin-1', {
        linkedEntityType: 'CONTACT', linkedEntityId: 'contact-2',
        linkedEntityName: 'Jane', email: 'customer@example.com',
      })).rejects.toThrow(ConflictException);
    });

    it('activates portal and returns temporary password', async () => {
      identityMock.customerUser.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(mockMenuCategory);
      identityMock.customerUser.create.mockResolvedValue(mockCustomerUser);

      const result = await service.activatePortal('tenant-1', 'admin-1', {
        linkedEntityType: 'CONTACT', linkedEntityId: 'contact-99',
        linkedEntityName: 'New Customer', email: 'new@example.com',
      });
      expect(result).toHaveProperty('temporaryPassword');
      expect((result as any).temporaryPassword).toHaveLength(10);
    });
  });

  // ── getPortalUser ────────────────────────────────────────────────────────

  describe('getPortalUser', () => {
    it('throws NotFoundException when user not found', async () => {
      identityMock.customerUser.findFirst.mockResolvedValue(null);
      await expect(service.getPortalUser('tenant-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('returns user when found', async () => {
      identityMock.customerUser.findFirst.mockResolvedValue(mockCustomerUser);
      const result = await service.getPortalUser('tenant-1', 'cu-1');
      expect(result).toMatchObject({ id: 'cu-1' });
    });
  });

  // ── getAnalytics ─────────────────────────────────────────────────────────

  describe('getAnalytics', () => {
    it('returns analytics counts', async () => {
      identityMock.customerUser.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7);
      identityMock.customerPortalLog.count.mockResolvedValue(3);
      identityMock.customerPortalLog.findMany.mockResolvedValue([]);

      const result = await service.getAnalytics('tenant-1');
      expect(result).toMatchObject({ total: 10, active: 7, inactive: 3, loginsToday: 3 });
    });
  });

  // ── deleteCategory ───────────────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('throws NotFoundException when category not found', async () => {
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(null);
      await expect(service.deleteCategory('tenant-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('soft-deletes category and unlinks users', async () => {
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(mockMenuCategory);
      identityMock.customerUser.updateMany.mockResolvedValue({ count: 2 });
      identityMock.customerMenuCategory.update.mockResolvedValue({ ...mockMenuCategory, isDeleted: true });

      const result = await service.deleteCategory('tenant-1', 'cat-1');
      expect(result).toEqual({ deleted: true });
      expect(identityMock.customerUser.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { menuCategoryId: 'cat-1' } }),
      );
    });
  });

  // ── seedDefaultCategories ────────────────────────────────────────────────

  describe('seedDefaultCategories', () => {
    it('creates default categories when they do not exist', async () => {
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(null);
      identityMock.customerMenuCategory.create.mockResolvedValue(mockMenuCategory);

      const result = await service.seedDefaultCategories('tenant-1', 'admin-1');
      expect(result).toEqual({ seeded: true });
      expect(identityMock.customerMenuCategory.create).toHaveBeenCalledTimes(2);
    });

    it('skips creation when categories already exist', async () => {
      identityMock.customerMenuCategory.findFirst.mockResolvedValue(mockMenuCategory);

      const result = await service.seedDefaultCategories('tenant-1', 'admin-1');
      expect(result).toEqual({ seeded: true });
      expect(identityMock.customerMenuCategory.create).not.toHaveBeenCalled();
    });
  });
});
