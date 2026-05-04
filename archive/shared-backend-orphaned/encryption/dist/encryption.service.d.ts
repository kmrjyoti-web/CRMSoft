import { ConfigService } from '@nestjs/config';
/** Interface for storage backends that hold encrypted data (used in key rotation) */
export interface EncryptedRecord {
    id: string;
    encryptedData: string;
}
export interface EncryptedRecordStorage {
    findMany(args?: {
        select?: {
            id: boolean;
            encryptedData: boolean;
        };
    }): Promise<EncryptedRecord[]>;
    update(args: {
        where: {
            id: string;
        };
        data: {
            encryptedData: string;
            encryptionVersion?: {
                increment: number;
            };
        };
    }): Promise<void>;
}
export declare class EncryptionService {
    private readonly config;
    private readonly key;
    private readonly ALGORITHM;
    private readonly IV_LENGTH;
    private readonly AUTH_TAG_LENGTH;
    constructor(config: ConfigService);
    encrypt(data: Record<string, any>): string;
    decrypt(encryptedString: string): Record<string, any>;
    mask(value: string, showLast?: number): string;
    /** Rotate encryption key for a set of records. Pass prisma model references directly. */
    rotateEncryptionKey(oldKey: string, newKey: string, storages: EncryptedRecordStorage[]): Promise<{
        rotated: number;
    }>;
    private encryptWithKey;
    private decryptWithKey;
}
//# sourceMappingURL=encryption.service.d.ts.map