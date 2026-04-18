import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from './encryption.service';
export interface VerifyResult {
    success: boolean;
    message: string;
    details?: Record<string, any>;
}
export declare class CredentialVerifierService {
    private readonly prisma;
    private readonly encryption;
    private readonly logger;
    constructor(prisma: PrismaService, encryption: EncryptionService);
    verify(tenantId: string, credentialId: string): Promise<VerifyResult>;
    private verifyByProvider;
    private verifySMTP;
    private verifyGmail;
    private verifyOutlook;
    private verifyWhatsApp;
    private verifyRazorpay;
    private verifyStripe;
    private verifyS3;
    private verifyGoogleMaps;
    private verifyExotel;
    private verifyTwilio;
    private verifySendGrid;
    private verifyMailgun;
    private verifyFirebase;
    private verifyKnowlarity;
}
