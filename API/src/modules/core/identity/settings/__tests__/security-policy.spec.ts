import { SecurityPolicyService } from '../services/security-policy.service';

const mockPrisma = {
  securityPolicy: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  ipAccessRule: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
} as any;
(mockPrisma as any).identity = mockPrisma;
(mockPrisma as any).platform = mockPrisma;

describe('SecurityPolicyService', () => {
  let service: SecurityPolicyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SecurityPolicyService(mockPrisma);
  });

  it('should validate password respecting min length and complexity', async () => {
    mockPrisma.securityPolicy.findUnique.mockResolvedValue({
      passwordMinLength: 8,
      passwordMaxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    });

    const result = await service.validatePassword('t1', 'weak');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Minimum 8 characters required');
    expect(result.errors).toContain('Must contain uppercase letter');
    expect(result.errors).toContain('Must contain special character');
  });

  it('should pass validation for a strong password', async () => {
    mockPrisma.securityPolicy.findUnique.mockResolvedValue({
      passwordMinLength: 8,
      passwordMaxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    });

    const result = await service.validatePassword('t1', 'Str0ng!Pass');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should block non-whitelisted IP when IP restriction is enabled', async () => {
    mockPrisma.securityPolicy.findUnique.mockResolvedValue({
      ipRestrictionEnabled: true,
      ipRules: [
        { ruleType: 'WHITELIST', ipAddress: '10.0.0.1', isActive: true },
      ],
    });

    const allowed = await service.isIpAllowed('t1', '192.168.1.100');
    expect(allowed).toBe(false);
  });

  it('should allow whitelisted IP', async () => {
    mockPrisma.securityPolicy.findUnique.mockResolvedValue({
      ipRestrictionEnabled: true,
      ipRules: [
        { ruleType: 'WHITELIST', ipAddress: '10.0.0.1', isActive: true },
      ],
    });

    const allowed = await service.isIpAllowed('t1', '10.0.0.1');
    expect(allowed).toBe(true);
  });
});
