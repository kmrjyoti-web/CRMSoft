import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/** Interface for storage backends that hold encrypted data (used in key rotation) */
export interface EncryptedRecord {
  id: string;
  encryptedData: string;
}

export interface EncryptedRecordStorage {
  findMany(args?: { select?: { id: boolean; encryptedData: boolean } }): Promise<EncryptedRecord[]>;
  update(args: { where: { id: string }; data: { encryptedData: string; encryptionVersion?: { increment: number } } }): Promise<void>;
}

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;

  constructor(private readonly config: ConfigService) {
    const masterKey = this.config.get<string>('ENCRYPTION_MASTER_KEY');
    if (!masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY is not set in environment');
    }
    this.key = crypto.scryptSync(masterKey, 'tenant-credential-salt', 32);
  }

  encrypt(data: Record<string, any>): string {
    const plaintext = JSON.stringify(data);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(encryptedString: string): Record<string, any> {
    const combined = Buffer.from(encryptedString, 'base64');
    const iv = combined.subarray(0, this.IV_LENGTH);
    const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
  }

  mask(value: string, showLast = 4): string {
    if (!value) return '(not set)';
    if (value.includes('@') && !value.startsWith('http')) {
      const [local, domain] = value.split('@');
      return `${local.length > 2 ? local.substring(0, 2) + '***' : '***'}@${domain}`;
    }
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.length <= showLast) return '****';
    return `****${value.substring(value.length - showLast)}`;
  }

  /** Rotate encryption key for a set of records. Pass prisma model references directly. */
  async rotateEncryptionKey(
    oldKey: string,
    newKey: string,
    storages: EncryptedRecordStorage[],
  ): Promise<{ rotated: number }> {
    const oldDerivedKey = crypto.scryptSync(oldKey, 'tenant-credential-salt', 32);
    const newDerivedKey = crypto.scryptSync(newKey, 'tenant-credential-salt', 32);
    let rotated = 0;
    for (const storage of storages) {
      const records = await storage.findMany({ select: { id: true, encryptedData: true } });
      for (const record of records) {
        const decrypted = this.decryptWithKey(record.encryptedData, oldDerivedKey);
        const reEncrypted = this.encryptWithKey(decrypted, newDerivedKey);
        await storage.update({ where: { id: record.id }, data: { encryptedData: reEncrypted, encryptionVersion: { increment: 1 } } });
        rotated++;
      }
    }
    return { rotated };
  }

  private encryptWithKey(data: Record<string, any>, key: Buffer): string {
    const plaintext = JSON.stringify(data);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  private decryptWithKey(encryptedString: string, key: Buffer): Record<string, any> {
    const combined = Buffer.from(encryptedString, 'base64');
    const iv = combined.subarray(0, this.IV_LENGTH);
    const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
  }
}
