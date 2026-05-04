import { Injectable, Logger } from '@nestjs/common';
import { CredentialProvider } from '@prisma/identity-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from './encryption.service';

export interface VerifyResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

@Injectable()
export class CredentialVerifierService {
  private readonly logger = new Logger(CredentialVerifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async verify(tenantId: string, credentialId: string): Promise<VerifyResult> {
    const credential = await this.prisma.tenantCredential.findFirst({
      where: { id: credentialId, tenantId },
    });

    if (!credential) {
      return { success: false, message: 'Credential not found' };
    }

    const decrypted = this.encryption.decrypt(credential.encryptedData);
    let result: VerifyResult;

    try {
      result = await this.verifyByProvider(credential.provider, decrypted);
    } catch (error: any) {
      result = { success: false, message: (error instanceof Error ? error.message : String(error)) || 'Verification failed' };
    }

    // Update credential status
    const newStatus = result.success ? 'ACTIVE' : (credential.verifyCount >= 2 ? 'EXPIRED' : 'ERROR');
    await this.prisma.tenantCredential.update({
      where: { id: credentialId },
      data: {
        status: newStatus,
        statusMessage: result.message,
        lastVerifiedAt: new Date(),
        lastVerifyError: result.success ? null : result.message,
        verifyCount: { increment: 1 },
      },
    });

    return result;
  }

  private async verifyByProvider(
    provider: CredentialProvider,
    credentials: Record<string, any>,
  ): Promise<VerifyResult> {
    switch (provider) {
      case 'SMTP':
        return this.verifySMTP(credentials);
      case 'GMAIL':
        return this.verifyGmail(credentials);
      case 'OUTLOOK':
        return this.verifyOutlook(credentials);
      case 'WHATSAPP_BUSINESS':
        return this.verifyWhatsApp(credentials);
      case 'RAZORPAY':
        return this.verifyRazorpay(credentials);
      case 'STRIPE':
        return this.verifyStripe(credentials);
      case 'AWS_S3':
        return this.verifyS3(credentials);
      case 'GOOGLE_MAPS':
        return this.verifyGoogleMaps(credentials);
      case 'EXOTEL':
        return this.verifyExotel(credentials);
      case 'TWILIO':
        return this.verifyTwilio(credentials);
      case 'SENDGRID':
        return this.verifySendGrid(credentials);
      case 'MAILGUN':
        return this.verifyMailgun(credentials);
      case 'FIREBASE':
        return this.verifyFirebase(credentials);
      case 'KNOWLARITY':
        return this.verifyKnowlarity(credentials);
      default:
