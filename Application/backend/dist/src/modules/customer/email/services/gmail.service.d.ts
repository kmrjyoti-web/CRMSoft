import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CredentialService } from '../../../softwarevendor/tenant-config/services/credential.service';
import { IEmailProviderService, SendEmailParams, SendResult, FetchOptions, FetchResult } from './email-provider.interface';
export declare class GmailService implements IEmailProviderService {
    private readonly prisma;
    private readonly credentialService;
    constructor(prisma: PrismaService, credentialService: CredentialService);
    sendEmail(accountId: string, params: SendEmailParams): Promise<SendResult>;
    fetchEmails(accountId: string, options: FetchOptions): Promise<FetchResult>;
    getAuthUrl(tenantId: string, userId: string, redirectUrl: string): Promise<string>;
    handleOAuthCallback(tenantId: string, code: string, userId: string, redirectUrl: string): Promise<{
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
    }>;
}
