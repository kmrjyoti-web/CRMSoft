import { EncryptionService } from '../services/encryption.service';

function makeService(masterKey = 'test-master-key-for-unit-tests') {
  const mockConfig = { get: jest.fn().mockReturnValue(masterKey) };
  const mockPrisma = {
    tenantCredential: { findMany: jest.fn().mockResolvedValue([]), update: jest.fn() },
    globalDefaultCredential: { findMany: jest.fn().mockResolvedValue([]), update: jest.fn() },
  } as any;
  return new EncryptionService(mockConfig as any, mockPrisma);
}

describe('EncryptionService', () => {
  it('encrypt and decrypt roundtrip returns original data', () => {
    const service = makeService();
    const original = { apiKey: 'sk_live_abc123', secret: 'my-secret-value' };
    const encrypted = service.encrypt(original);
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('GCM tamper detection throws on modified ciphertext', () => {
    const service = makeService();
    const encrypted = service.encrypt({ key: 'value' });

    // Tamper with the encrypted string
    const buf = Buffer.from(encrypted, 'base64');
    buf[buf.length - 1] ^= 0xff; // flip last byte
    const tampered = buf.toString('base64');

    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('mask shows last 4 characters of API key', () => {
    const service = makeService();
    expect(service.mask('sk_live_abc123xyz7890')).toBe('****7890');
  });

  it('mask handles email addresses', () => {
    const service = makeService();
    expect(service.mask('admin@example.com')).toBe('ad***@example.com');
  });

  it('rotateEncryptionKey re-encrypts all credentials', async () => {
    const oldKey = 'old-master-key-for-rotation-test';
    const newKey = 'new-master-key-for-rotation-test';

    const oldService = makeService(oldKey);
    const encrypted = oldService.encrypt({ apiKey: 'test-key' });

    const mockPrisma = {
      tenantCredential: {
        findMany: jest.fn().mockResolvedValue([{ id: 'cred-1', encryptedData: encrypted }]),
        update: jest.fn(),
      },
      globalDefaultCredential: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
    } as any;

    const service = new EncryptionService(
      { get: jest.fn().mockReturnValue(oldKey) } as any,
      mockPrisma,
    );

    const result = await service.rotateEncryptionKey(oldKey, newKey);

    expect(result.rotated).toBe(1);
    expect(mockPrisma.tenantCredential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cred-1' },
        data: expect.objectContaining({ encryptionVersion: { increment: 1 } }),
      }),
    );
  });
});
