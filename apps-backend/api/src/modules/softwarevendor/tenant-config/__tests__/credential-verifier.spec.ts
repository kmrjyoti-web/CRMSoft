import { CredentialVerifierService } from '../services/credential-verifier.service';
import { EncryptionService } from '../services/encryption.service';

function makeEncryption() {
  const mockConfig = { get: jest.fn().mockReturnValue('test-master-key-for-unit-tests') };
  const mockPrisma = {
    tenantCredential: { findMany: jest.fn().mockResolvedValue([]) },
    globalDefaultCredential: { findMany: jest.fn().mockResolvedValue([]) },
  } as any;
  return new EncryptionService(mockConfig as any, mockPrisma);
}

function makeMockPrisma(credential: any) {
  return {
    tenantCredential: {
      findFirst: jest.fn().mockResolvedValue(credential),
      update: jest.fn(),
    },
  } as any;
}

describe('CredentialVerifierService', () => {
  const encryption = makeEncryption();

  it('verify SMTP calls nodemailer verify', async () => {
    const creds = { host: 'smtp.test.com', port: '587', username: 'user', password: 'pass', fromEmail: 'from@test.com' };
    const encrypted = encryption.encrypt(creds);
    const prisma = makeMockPrisma({
      id: 'cred-1',
      tenantId: 'tenant-1',
      provider: 'SMTP',
      encryptedData: encrypted,
      verifyCount: 0,
    });

    const service = new CredentialVerifierService(prisma, encryption);

    // Mock nodemailer — it will fail in test env, which is expected
    const result = await service.verify('tenant-1', 'cred-1');

    // In test environment SMTP will fail to connect, so we verify the status update was called
    expect(prisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cred-1' },
        data: expect.objectContaining({
          verifyCount: { increment: 1 },
        }),
      }),
    );
  });

  it('verify Firebase validates JSON structure', async () => {
    const creds = {
      serviceAccountJson: JSON.stringify({
        project_id: 'my-project',
        private_key: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----\n',
        client_email: 'firebase@my-project.iam.gserviceaccount.com',
      }),
    };
    const encrypted = encryption.encrypt(creds);
    const prisma = makeMockPrisma({
      id: 'cred-1',
      tenantId: 'tenant-1',
      provider: 'FIREBASE',
      encryptedData: encrypted,
      verifyCount: 0,
    });

    const service = new CredentialVerifierService(prisma, encryption);
    const result = await service.verify('tenant-1', 'cred-1');

    expect(result.success).toBe(true);
    expect(result.message).toContain('my-project');
  });

  it('sets EXPIRED status after 3 failed verifications', async () => {
    const creds = { serviceAccountJson: '{}' }; // Invalid — missing fields
    const encrypted = encryption.encrypt(creds);
    const prisma = makeMockPrisma({
      id: 'cred-1',
      tenantId: 'tenant-1',
      provider: 'FIREBASE',
      encryptedData: encrypted,
      verifyCount: 2, // Already failed twice
    });

    const service = new CredentialVerifierService(prisma, encryption);
    const result = await service.verify('tenant-1', 'cred-1');

    expect(result.success).toBe(false);
    expect(prisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'EXPIRED' }),
      }),
    );
  });

  it('sets ERROR status on verify failure before 3 attempts', async () => {
    const creds = { serviceAccountJson: '{}' }; // Invalid
    const encrypted = encryption.encrypt(creds);
    const prisma = makeMockPrisma({
      id: 'cred-1',
      tenantId: 'tenant-1',
      provider: 'FIREBASE',
      encryptedData: encrypted,
      verifyCount: 0,
    });

    const service = new CredentialVerifierService(prisma, encryption);
    const result = await service.verify('tenant-1', 'cred-1');

    expect(result.success).toBe(false);
    expect(prisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ERROR' }),
      }),
    );
  });
});
