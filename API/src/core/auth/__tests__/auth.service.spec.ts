import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService — Multi-Login', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let config: any;

  const mockAdmin = {
    id: 'u-1', email: 'admin@crm.com', password: '', firstName: 'Admin',
    lastName: 'User', status: 'ACTIVE', userType: 'ADMIN',
    role: { id: 'r-1', name: 'SUPER_ADMIN', displayName: 'Super Admin' },
    customerProfile: null, referralPartner: null,
  };

  const mockEmployee = {
    ...mockAdmin, id: 'u-2', email: 'sales@crm.com', userType: 'EMPLOYEE',
    role: { id: 'r-2', name: 'SALES_EXECUTIVE', displayName: 'Sales Executive' },
  };

  const mockCustomer = {
    ...mockAdmin, id: 'u-3', email: 'cust@gmail.com', userType: 'CUSTOMER',
    role: { id: 'r-3', name: 'CUSTOMER', displayName: 'Customer' },
    customerProfile: { companyName: 'TechCorp' },
  };

  const mockPartner = {
    ...mockAdmin, id: 'u-4', email: 'partner@gmail.com', userType: 'REFERRAL_PARTNER',
    role: { id: 'r-4', name: 'REFERRAL_PARTNER', displayName: 'Referral Partner' },
    referralPartner: { referralCode: 'SUR-ABC123', commissionRate: 10, totalReferrals: 5 },
  };

  beforeEach(async () => {
    const hashedPw = await bcrypt.hash('Admin@123', 12);
    mockAdmin.password = hashedPw;
    mockEmployee.password = hashedPw;
    mockCustomer.password = hashedPw;
    mockPartner.password = hashedPw;

    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      role: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      superAdmin: { findUnique: jest.fn(), update: jest.fn() },
      customerProfile: { upsert: jest.fn() },
      referralPartner: { upsert: jest.fn() },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verify: jest.fn(),
    };
    config = { get: jest.fn().mockReturnValue('secret') };
    service = new AuthService(prisma as any, jwt as any, config as any);
  });

  // ─── ADMIN LOGIN ───
  describe('adminLogin()', () => {
    it('should login ADMIN user successfully', async () => {
      prisma.user.findFirst.mockResolvedValue(mockAdmin);
      prisma.user.update.mockResolvedValue(mockAdmin);
      const result = await service.adminLogin('admin@crm.com', 'Admin@123');
      expect(result.user.userType).toBe('ADMIN');
      expect(result.accessToken).toBeDefined();
    });

    it('should reject EMPLOYEE trying admin portal', async () => {
      prisma.user.findFirst.mockResolvedValue(mockEmployee);
      await expect(service.adminLogin('sales@crm.com', 'Admin@123'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should reject CUSTOMER trying admin portal', async () => {
      prisma.user.findFirst.mockResolvedValue(mockCustomer);
      await expect(service.adminLogin('cust@gmail.com', 'Admin@123'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should reject wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockAdmin);
      await expect(service.adminLogin('admin@crm.com', 'WrongPass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── EMPLOYEE LOGIN ───
  describe('employeeLogin()', () => {
    it('should login EMPLOYEE user', async () => {
      prisma.user.findFirst.mockResolvedValue(mockEmployee);
      prisma.user.update.mockResolvedValue(mockEmployee);
      const result = await service.employeeLogin('sales@crm.com', 'Admin@123');
      expect(result.user.userType).toBe('EMPLOYEE');
    });

    it('should reject ADMIN trying employee portal', async () => {
      prisma.user.findFirst.mockResolvedValue(mockAdmin);
      await expect(service.employeeLogin('admin@crm.com', 'Admin@123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── CUSTOMER LOGIN ───
  describe('customerLogin()', () => {
    it('should login CUSTOMER user', async () => {
      prisma.user.findFirst.mockResolvedValue(mockCustomer);
      prisma.user.update.mockResolvedValue(mockCustomer);
      const result = await service.customerLogin('cust@gmail.com', 'Admin@123');
      expect(result.user.userType).toBe('CUSTOMER');
      expect(result.user.profile).toBeDefined();
    });

    it('should reject EMPLOYEE trying customer portal', async () => {
      prisma.user.findFirst.mockResolvedValue(mockEmployee);
      await expect(service.customerLogin('sales@crm.com', 'Admin@123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── PARTNER LOGIN ───
  describe('partnerLogin()', () => {
    it('should login REFERRAL_PARTNER user', async () => {
      prisma.user.findFirst.mockResolvedValue(mockPartner);
      prisma.user.update.mockResolvedValue(mockPartner);
      const result = await service.partnerLogin('partner@gmail.com', 'Admin@123');
      expect(result.user.userType).toBe('REFERRAL_PARTNER');
      expect(result.user.referralCode).toBe('SUR-ABC123');
    });

    it('should reject ADMIN trying partner portal', async () => {
      prisma.user.findFirst.mockResolvedValue(mockAdmin);
      await expect(service.partnerLogin('admin@crm.com', 'Admin@123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── CROSS-PORTAL REJECTION ───
  describe('cross-portal rejection', () => {
    it('customer cannot login as admin', async () => {
      prisma.user.findFirst.mockResolvedValue(mockCustomer);
      await expect(service.adminLogin('cust@gmail.com', 'Admin@123'))
        .rejects.toThrow('This account cannot login from this portal');
    });

    it('partner cannot login as employee', async () => {
      prisma.user.findFirst.mockResolvedValue(mockPartner);
      await expect(service.employeeLogin('partner@gmail.com', 'Admin@123'))
        .rejects.toThrow('This account cannot login from this portal');
    });

    it('non-existent email throws Invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.adminLogin('nobody@crm.com', 'Admin@123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('inactive user is rejected', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockAdmin, status: 'INACTIVE' });
      await expect(service.adminLogin('admin@crm.com', 'Admin@123'))
        .rejects.toThrow('Account inactive');
    });
  });

  // ─── CUSTOMER REGISTER ───
  describe('registerCustomer()', () => {
    it('should register and return tokens', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.role.findFirst.mockResolvedValue({ id: 'r-3', name: 'CUSTOMER' });
      prisma.user.create.mockResolvedValue({
        ...mockCustomer, customerProfile: { companyName: 'NewCorp' },
      });
      const result = await service.registerCustomer({
        email: 'new@gmail.com', password: 'Cust@123',
        firstName: 'New', lastName: 'Cust', companyName: 'NewCorp',
      });
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue(mockCustomer);
      await expect(service.registerCustomer({
        email: 'cust@gmail.com', password: 'Cust@123',
        firstName: 'X', lastName: 'Y',
      })).rejects.toThrow(ConflictException);
    });
  });
});
