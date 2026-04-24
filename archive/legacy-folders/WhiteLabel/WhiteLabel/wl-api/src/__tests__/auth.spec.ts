import { AuthService } from '../modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

const mockPrisma = {
  whiteLabelPartner: { findUnique: jest.fn() },
};

const mockJwt = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

const mockConfig = {
  get: (key: string, def?: string) => {
    const m: Record<string, string> = {
      ADMIN_EMAIL: 'admin@crmsoft.in',
      ADMIN_PASSWORD: 'SuperAdmin@123',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '7d',
    };
    return m[key] ?? def;
  },
};

const makeService = () =>
  new AuthService(mockPrisma as any, mockJwt as unknown as JwtService, mockConfig as unknown as ConfigService);

describe('AuthService', () => {
  afterEach(() => jest.clearAllMocks());

  it('admin login returns JWT', async () => {
    const svc = makeService();
    const result = await svc.adminLogin('admin@crmsoft.in', 'SuperAdmin@123');
    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.role).toBe('MASTER_ADMIN');
  });

  it('admin login with wrong password throws 401', async () => {
    const svc = makeService();
    await expect(svc.adminLogin('admin@crmsoft.in', 'wrongpass')).rejects.toThrow(UnauthorizedException);
  });

  it('admin login with wrong email throws 401', async () => {
    const svc = makeService();
    await expect(svc.adminLogin('other@crmsoft.in', 'SuperAdmin@123')).rejects.toThrow(UnauthorizedException);
  });

  it('partner login with unknown email throws 401', async () => {
    mockPrisma.whiteLabelPartner.findUnique.mockResolvedValue(null);
    const svc = makeService();
    await expect(svc.partnerLogin('unknown@partner.com', 'pass')).rejects.toThrow(UnauthorizedException);
  });
});
