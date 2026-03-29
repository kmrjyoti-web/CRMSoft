import { ApiKeyService } from '../services/api-key.service';
import { createHash } from 'crypto';

const mockPrisma = {
  tenant: { findUnique: jest.fn() },
  apiKey: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
} as any;
(mockPrisma as any).working = mockPrisma;

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApiKeyService(mockPrisma);
  });

  it('should create API key with correct format', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', slug: 'acme' });
    mockPrisma.apiKey.create.mockResolvedValue({ id: 'key1', name: 'Test Key' });

    const result = await service.create('t1', {
      name: 'Test Key',
      scopes: ['leads:read', 'contacts:read'],
    }, 'user1', 'John Doe');

    expect(result.fullKey).toMatch(/^crm_live_acme_/);
    expect(result.fullKey.length).toBeGreaterThan(20);
    expect(result.warning).toBeDefined();
  });

  it('should store SHA-256 hash, not plaintext key', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', slug: 'acme' });
    mockPrisma.apiKey.create.mockResolvedValue({ id: 'key1' });

    const result = await service.create('t1', {
      name: 'Test',
      scopes: ['leads:read'],
    }, 'user1', 'Jane');

    const createCall = mockPrisma.apiKey.create.mock.calls[0][0];
    const expectedHash = createHash('sha256').update(result.fullKey).digest('hex');
    expect(createCall.data.keyHash).toBe(expectedHash);
  });

  it('should reject invalid scopes', async () => {
    await expect(
      service.create('t1', {
        name: 'Bad',
        scopes: ['invalid:scope'],
      }, 'user1', 'Test'),
    ).rejects.toThrow();
  });

  it('should validate active API key', async () => {
    const keyHash = createHash('sha256').update('testkey').digest('hex');
    mockPrisma.apiKey.findUnique.mockResolvedValue({
      id: 'k1', tenantId: 't1', status: 'API_ACTIVE',
      scopes: ['leads:read'], expiresAt: null,
    });
    mockPrisma.apiKey.update.mockResolvedValue({});

    const result = await service.validate('testkey');
    expect(result).not.toBeNull();
    expect(result!.tenantId).toBe('t1');
  });

  it('should reject revoked API key', async () => {
    mockPrisma.apiKey.findUnique.mockResolvedValue({
      id: 'k1', status: 'API_REVOKED',
    });

    const result = await service.validate('revokedkey');
    expect(result).toBeNull();
  });

  it('should reject expired API key and update status', async () => {
    mockPrisma.apiKey.findUnique.mockResolvedValue({
      id: 'k1', status: 'API_ACTIVE',
      expiresAt: new Date('2020-01-01'),
    });
    mockPrisma.apiKey.update.mockResolvedValue({});

    const result = await service.validate('expiredkey');
    expect(result).toBeNull();
    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'API_EXPIRED' },
      }),
    );
  });

  it('should check IP allowlist', () => {
    expect(service.isIpAllowed({ allowedIps: [] }, '1.2.3.4')).toBe(true);
    expect(service.isIpAllowed({ allowedIps: ['1.2.3.4'] }, '1.2.3.4')).toBe(true);
    expect(service.isIpAllowed({ allowedIps: ['1.2.3.4'] }, '5.6.7.8')).toBe(false);
    expect(service.isIpAllowed({ allowedIps: null }, '1.2.3.4')).toBe(true);
  });

  it('should return available scopes', () => {
    const scopes = service.getAvailableScopes();
    expect(scopes.length).toBeGreaterThan(20);
    expect(scopes.find(s => s.scope === 'leads:read')).toBeDefined();
    expect(scopes.find(s => s.scope === 'webhooks:manage')).toBeDefined();
  });

  it('should revoke API key', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({ id: 'k1', name: 'Test' });
    mockPrisma.apiKey.update.mockResolvedValue({});

    await service.revoke('t1', 'k1', 'Security breach', 'user1');
    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'API_REVOKED',
          revokedReason: 'Security breach',
        }),
      }),
    );
  });
});
