import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
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

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Format: base64(iv + authTag + ciphertext)
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
  }

  decrypt(encryptedString: string): Record<string, any> {
    const combined = Buffer.from(encryptedString, 'base64');

    const iv = combined.subarray(0, this.IV_LENGTH);
    const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  mask(value: string, showLast = 4): string {
    if (!value) return '(not set)';

    // Email: show first 2 + *** + @domain
    if (value.includes('@') && !value.startsWith('http')) {
      const [local, domain] = value.split('@');
      const masked = local.length > 2
        ? local.substring(0, 2) + '***'
        : '***';
      return `${masked}@${domain}`;
    }

    // URL: show full
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Short values: full mask
    if (value.length <= showLast) {
      return '****';
    }

    // Default: show last N chars
    const visible = value.substring(value.length - showLast);
    return `****${visible}`;
  }

  async rotateEncryptionKey(oldKey: string, newKey: string): Promise<{ rotated: number }> {
    const oldDerivedKey = crypto.scryptSync(oldKey, 'tenant-credential-salt', 32);
    const newDerivedKey = crypto.scryptSync(newKey, 'tenant-credential-salt', 32);
    let rotated = 0;

    // Rotate TenantCredential records
    const credentials = await this.prisma.tenantCredential.findMany({
      select: { id: true, encryptedData: true },
    });

    for (const cred of credentials) {
      const decrypted = this.decryptWithKey(cred.encryptedData, oldDerivedKey);
      const reEncrypted = this.encryptWithKey(decrypted, newDerivedKey);
      await this.prisma.tenantCredential.update({
        where: { id: cred.id },
        data: { encryptedData: reEncrypted, encryptionVersion: { increment: 1 } },
      });
      rotated++;
    }

    // Rotate GlobalDefaultCredential records
    const globals = await this.prisma.globalDefaultCredential.findMany({
      select: { id: true, encryptedData: true },
    });

    for (const g of globals) {
      const decrypted = this.decryptWithKey(g.encryptedData, oldDerivedKey);
      const reEncrypted = this.encryptWithKey(decrypted, newDerivedKey);
      await this.prisma.globalDefaultCredential.update({
        where: { id: g.id },
        data: { encryptedData: reEncrypted, encryptionVersion: { increment: 1 } },
      });
      rotated++;
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
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  }
}
