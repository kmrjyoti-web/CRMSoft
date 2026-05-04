import { ApiKeyGuard } from '../guards/api-key.guard';
import { Reflector } from '@nestjs/core';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let mockReflector: Reflector;
  let mockApiKeyService: any;

  beforeEach(() => {
    mockReflector = { getAllAndOverride: jest.fn() } as any;
    mockApiKeyService = {
      validate: jest.fn(),
      isIpAllowed: jest.fn().mockReturnValue(true),
    };
    guard = new ApiKeyGuard(mockReflector, mockApiKeyService);
  });

  const createMockContext = (headers: Record<string, string> = {}, ip = '127.0.0.1') => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        ip,
        connection: { remoteAddress: ip },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  });

  it('should allow public routes without API key', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const context = createMockContext();
    expect(await guard.canActivate(context as any)).toBe(true);
  });

  it('should throw when no API key provided', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const context = createMockContext();
    await expect(guard.canActivate(context as any)).rejects.toThrow();
  });

  it('should validate API key from X-Api-Key header', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockApiKeyService.validate.mockResolvedValue({
      apiKey: { id: 'k1', name: 'Test', scopes: ['leads:read'], tenantId: 't1' },
      tenantId: 't1',
    });

    const context = createMockContext({ 'x-api-key': 'crm_live_test_abc123' });
    expect(await guard.canActivate(context as any)).toBe(true);
  });

  it('should validate API key from Bearer token', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockApiKeyService.validate.mockResolvedValue({
      apiKey: { id: 'k1', name: 'Test', scopes: [], tenantId: 't1' },
      tenantId: 't1',
    });

    const context = createMockContext({ authorization: 'Bearer crm_live_test_abc123' });
    expect(await guard.canActivate(context as any)).toBe(true);
  });

  it('should reject invalid API key', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockApiKeyService.validate.mockResolvedValue(null);

    const context = createMockContext({ 'x-api-key': 'invalid-key' });
    await expect(guard.canActivate(context as any)).rejects.toThrow();
  });

  it('should reject blocked IP', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    mockApiKeyService.validate.mockResolvedValue({
      apiKey: { id: 'k1', scopes: [], tenantId: 't1' },
      tenantId: 't1',
    });
    mockApiKeyService.isIpAllowed.mockReturnValue(false);

    const context = createMockContext({ 'x-api-key': 'crm_live_test_abc' }, '10.0.0.1');
    await expect(guard.canActivate(context as any)).rejects.toThrow();
  });

  it('should attach apiKey info to request', async () => {
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const apiKey = { id: 'k1', name: 'TestKey', scopes: ['leads:read'], tenantId: 't1' };
    mockApiKeyService.validate.mockResolvedValue({ apiKey, tenantId: 't1' });

    const request: any = { headers: { 'x-api-key': 'testkey' }, ip: '127.0.0.1', connection: {} };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };

    await guard.canActivate(context as any);
    expect(request.apiKey).toBe(apiKey);
    expect(request.tenantId).toBe('t1');
    expect(request.apiKeyScopes).toEqual(['leads:read']);
  });
});
