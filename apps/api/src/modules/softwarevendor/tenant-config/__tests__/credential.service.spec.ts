import { CredentialService } from '../services/credential.service';
import { EncryptionService } from '../services/encryption.service';
import { CredentialSchemaService } from '../services/credential-schema.service';

function makeEncryption() {
  const mockConfig = { get: jest.fn().mockReturnValue('test-master-key-for-unit-tests') };
  const mockPrisma = {
    tenantCredential: { findMany: jest.fn().mockResolvedValue([]) },
    globalDefaultCredential: { findMany: jest.fn().mockResolvedValue([]) },
  } as any;
  return new EncryptionService(mockConfig as any, mockPrisma);
}

function makeMockPrisma(overrides: any = {}) {
  return {
    tenantCredential: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      upsert: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    globalDefaultCredential: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    credentialAccessLog: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    ...overrides,
  } as any;
}

describe('CredentialService', () => {
  const encryption = makeEncryption();
  const schemaService = new CredentialSchemaService();

  it('get decrypts and returns credential data', async () => {
    const plainData = { apiKey: 'sk_live_test123', secret: 'my-secret' };
    const encrypted = encryption.encrypt(plainData);

    const prisma = makeMockPrisma({
      tenantCredential: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'cred-1',
          encryptedData: encrypted,
          dailyUsageLimit: null,
          dailyUsageCount: 0,
        }),
        update: jest.fn().mockRejectedValue(new Error('ignore')),
      },
    });
    const service = new CredentialService(prisma, encryption, schemaService);

    const result = await service.get('tenant-1', 'STRIPE');

    expect(result).toEqual(plainData);
  });

  it('get falls back to global default when tenant credential not found', async () => {
    const globalData = { apiKey: 'global-key' };
    const encrypted = encryption.encrypt(globalData);

    const prisma = makeMockPrisma({
      tenantCredential: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      globalDefaultCredential: {
        findFirst: jest.fn().mockResolvedValue({
          encryptedData: encrypted,
          isEnabled: true,
          status: 'ACTIVE',
        }),
      },
    });
    const service = new CredentialService(prisma, encryption, schemaService);

    const result = await service.get('tenant-1', 'STRIPE');

    expect(result).toEqual(globalData);
  });

  it('get returns null when no credential exists', async () => {
    const prisma = makeMockPrisma();
    const service = new CredentialService(prisma, encryption, schemaService);

    const result = await service.get('tenant-1', 'RAZORPAY');

    expect(result).toBeNull();
  });

  it('upsert validates schema before saving', async () => {
    const prisma = makeMockPrisma();
    const service = new CredentialService(prisma, encryption, schemaService);

    await expect(
      service.upsert('tenant-1', {
        provider: 'RAZORPAY',
        credentials: { keyId: 'rzp_test' }, // missing keySecret
        userId: 'user-1',
        userName: 'Admin',
      }),
    ).rejects.toThrow('Key Secret is required');
  });

  it('upsert encrypts credentials before storing', async () => {
    const prisma = makeMockPrisma({
      tenantCredential: {
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: 'cred-1' }),
        update: jest.fn(),
      },
    });
    const service = new CredentialService(prisma, encryption, schemaService);

    await service.upsert('tenant-1', {
      provider: 'RAZORPAY',
      credentials: { keyId: 'rzp_test', keySecret: 'secret123' },
      userId: 'user-1',
      userName: 'Admin',
    });

    const call = prisma.tenantCredential.upsert.mock.calls[0][0];
    expect(call.create.encryptedData).toBeDefined();
    // Should be base64 encrypted, not plain JSON
    expect(call.create.encryptedData).not.toContain('rzp_test');
  });

  it('revoke sets status to REVOKED and clears data', async () => {
    const prisma = makeMockPrisma({
      tenantCredential: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'cred-1',
          provider: 'STRIPE',
          instanceName: null,
        }),
        update: jest.fn(),
      },
    });
    const service = new CredentialService(prisma, encryption, schemaService);

    await service.revoke('tenant-1', 'cred-1', 'user-1', 'Admin');

    expect(prisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cred-1' },
        data: expect.objectContaining({ status: 'REVOKED' }),
      }),
    );
  });
});
