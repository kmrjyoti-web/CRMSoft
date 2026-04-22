import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../jwt.strategy';

describe('JwtStrategy — validate()', () => {
  let strategy: JwtStrategy;
  let prisma: any;

  const mockUser = {
    id: 'u-1',
    email: 'admin@crm.com',
    firstName: 'Admin',
    lastName: 'User',
    status: 'ACTIVE',
    userType: 'ADMIN',
    tenantId: 't-1',
    departmentId: null,
    department: null,
    role: { id: 'r-1', name: 'ADMIN', displayName: 'Admin', level: 1 },
  };

  beforeEach(() => {
    prisma = {
      identity: {
        user: { findFirst: jest.fn() },
        tenant: { findUnique: jest.fn().mockResolvedValue({ industryCode: 'SOFTWARE_VENDOR' }) },
      },
    };

    // Bypass PassportStrategy constructor
    strategy = Object.create(JwtStrategy.prototype) as JwtStrategy;
    (strategy as any).prisma = prisma;
  });

  describe('SuperAdmin path', () => {
    it('should return super admin payload without DB lookup', async () => {
      const payload = {
        sub: 'sa-1', email: 'sa@crm.com',
        role: 'PLATFORM_ADMIN', userType: 'SUPER_ADMIN', isSuperAdmin: true,
      };
      const result = await strategy.validate(payload);

      expect(result.isSuperAdmin).toBe(true);
      expect(result.id).toBe('sa-1');
      expect(result.role).toBe('PLATFORM_ADMIN');
      expect(prisma.identity.user.findFirst).not.toHaveBeenCalled();
    });

    it('should use default role/userType for super admin when missing', async () => {
      const payload = {
        sub: 'sa-1', email: 'sa@crm.com',
        role: undefined as any, userType: undefined as any, isSuperAdmin: true,
      };
      const result = await strategy.validate(payload);
      expect(result.role).toBe('PLATFORM_ADMIN');
      expect(result.userType).toBe('SUPER_ADMIN');
    });
  });

  describe('Vendor path', () => {
    it('should return vendor payload without DB lookup when userType is VENDOR', async () => {
      const payload = {
        sub: 'v-1', email: 'vendor@shop.com',
        role: 'VENDOR', userType: 'VENDOR',
      };
      const result = await strategy.validate(payload);

      expect(result.role).toBe('VENDOR');
      expect(result.userType).toBe('VENDOR');
      expect(result.vendorId).toBe('v-1');
      expect(prisma.identity.user.findFirst).not.toHaveBeenCalled();
    });

    it('should return vendor payload when vendorId is present in payload', async () => {
      const payload: any = {
        sub: 'v-2', email: 'vendor2@shop.com',
        role: 'VENDOR', userType: 'EMPLOYEE', vendorId: 'v-2',
      };
      const result = await strategy.validate(payload);
      expect(result.role).toBe('VENDOR');
      expect(result.vendorId).toBe('v-2');
    });
  });

  describe('Regular tenant user path', () => {
    it('should return full user details with businessTypeCode', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(mockUser);
      const payload = {
        sub: 'u-1', email: 'admin@crm.com',
        role: 'ADMIN', userType: 'ADMIN', tenantId: 't-1',
      };

      const result = await strategy.validate(payload);

      expect(result.id).toBe('u-1');
      expect(result.role).toBe('ADMIN');
      expect(result.tenantId).toBe('t-1');
      expect(result.businessTypeCode).toBe('SOFTWARE_VENDOR');
      expect(prisma.identity.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u-1', tenantId: 't-1' } }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(null);
      const payload = {
        sub: 'u-999', email: 'ghost@crm.com',
        role: 'ADMIN', userType: 'ADMIN', tenantId: 't-1',
      };
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user status is INACTIVE', async () => {
      prisma.identity.user.findFirst.mockResolvedValue({ ...mockUser, status: 'INACTIVE' });
      const payload = {
        sub: 'u-1', email: 'admin@crm.com',
        role: 'ADMIN', userType: 'ADMIN', tenantId: 't-1',
      };
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing tenant industryCode gracefully', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(mockUser);
      prisma.identity.tenant.findUnique.mockResolvedValue({ industryCode: null });

      const payload = {
        sub: 'u-1', email: 'admin@crm.com',
        role: 'ADMIN', userType: 'ADMIN', tenantId: 't-1',
      };
      const result = await strategy.validate(payload);
      expect(result.businessTypeCode).toBeUndefined();
    });

    it('should enforce tenant isolation — only finds user within correct tenantId', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(null);
      const payload = {
        sub: 'u-1', email: 'admin@crm.com',
        role: 'ADMIN', userType: 'ADMIN', tenantId: 't-OTHER',
      };
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(prisma.identity.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u-1', tenantId: 't-OTHER' } }),
      );
    });
  });
});
