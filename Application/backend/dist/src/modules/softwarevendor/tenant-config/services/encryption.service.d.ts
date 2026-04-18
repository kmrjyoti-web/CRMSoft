import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class EncryptionService {
    private readonly config;
    private readonly prisma;
    private readonly key;
    private readonly ALGORITHM;
    private readonly IV_LENGTH;
    private readonly AUTH_TAG_LENGTH;
    constructor(config: ConfigService, prisma: PrismaService);
    encrypt(data: Record<string, any>): string;
    decrypt(encryptedString: string): Record<string, any>;
    mask(value: string, showLast?: number): string;
    rotateEncryptionKey(oldKey: string, newKey: string): Promise<{
        rotated: number;
    }>;
    private encryptWithKey;
    private decryptWithKey;
}
