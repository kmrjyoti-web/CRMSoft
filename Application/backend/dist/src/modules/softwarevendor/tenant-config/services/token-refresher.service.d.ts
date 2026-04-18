import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from './encryption.service';
export declare class TokenRefresherService {
    private readonly prisma;
    private readonly encryption;
    private readonly logger;
    constructor(prisma: PrismaService, encryption: EncryptionService);
    refreshExpiringTokens(): Promise<void>;
    refreshToken(credentialId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetDailyUsage(): Promise<void>;
    private refreshGoogle;
    private refreshMicrosoft;
    private refreshDropbox;
}
