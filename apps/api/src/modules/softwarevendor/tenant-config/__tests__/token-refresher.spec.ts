import { TokenRefresherService } from '../services/token-refresher.service';
import { EncryptionService } from '../services/encryption.service';

function makeEncryption() {
  const mockConfig = { get: jest.fn().mockReturnValue('test-master-key-for-unit-tests') };
  const mockPrisma = {
    tenantCredential: { findMany: jest.fn().mockResolvedValue([]) },
    globalDefaultCredential: { findMany: jest.fn().mockResolvedValue([]) },
  } as any;
  return new EncryptionService(mockConfig as any, mockPrisma);
}

describe('TokenRefresherService', () => {
  const encryption = makeEncryption();

  it('refreshToken updates credential with new token on success', async () => {
    const creds = {
      clientId: 'client-id',
      clientSecret: 'client-secret',
      refreshToken: 'refresh-token',
    };
    const encrypted = encryption.encrypt(creds);

    const mockPrisma = {
      tenantCredential: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cred-1',
          provider: 'GMAIL',
          encryptedData: encrypted,
          refreshFailCount: 0,
        }),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    } as any;

    // Mock fetch to simulate Google token response
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'new-access-token',
        expires_in: 3600,
        refresh_token: 'new-refresh-token',
      }),
    }) as any;

    const service = new TokenRefresherService(mockPrisma, encryption);
    const result = await service.refreshToken('cred-1');

    expect(result.success).toBe(true);
    expect(mockPrisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          refreshFailCount: 0,
          status: 'ACTIVE',
        }),
      }),
    );

    global.fetch = originalFetch;
  });

  it('refreshToken updates tokenExpiresAt on success', async () => {
    const creds = { clientId: 'id', clientSecret: 'secret', refreshToken: 'token' };
    const encrypted = encryption.encrypt(creds);

    const mockPrisma = {
      tenantCredential: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cred-1',
          provider: 'GMAIL',
          encryptedData: encrypted,
          refreshFailCount: 0,
        }),
        update: jest.fn(),
      },
    } as any;

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'new', expires_in: 3600 }),
    }) as any;

    const service = new TokenRefresherService(mockPrisma, encryption);
    await service.refreshToken('cred-1');

    const updateCall = mockPrisma.tenantCredential.update.mock.calls[0][0];
    expect(updateCall.data.tokenExpiresAt).toBeInstanceOf(Date);

    global.fetch = originalFetch;
  });

  it('sets EXPIRED after 3 consecutive refresh failures', async () => {
    const creds = { clientId: 'id', clientSecret: 'secret', refreshToken: 'bad-token' };
    const encrypted = encryption.encrypt(creds);

    const mockPrisma = {
      tenantCredential: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cred-1',
          provider: 'GMAIL',
          encryptedData: encrypted,
          refreshFailCount: 2, // Already failed twice
          status: 'ACTIVE',
        }),
        update: jest.fn(),
      },
    } as any;

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Invalid grant'),
    }) as any;

    const service = new TokenRefresherService(mockPrisma, encryption);
    const result = await service.refreshToken('cred-1');

    expect(result.success).toBe(false);
    expect(mockPrisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          refreshFailCount: 3,
          status: 'EXPIRED',
        }),
      }),
    );

    global.fetch = originalFetch;
  });
});
