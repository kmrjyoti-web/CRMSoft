import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IEmailProviderService, SendEmailParams, SendResult, FetchOptions, FetchResult } from './email-provider.interface';
export declare class ImapSmtpService implements IEmailProviderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    sendEmail(accountId: string, params: SendEmailParams): Promise<SendResult>;
    fetchEmails(accountId: string, options: FetchOptions): Promise<FetchResult>;
    testConnection(config: {
        smtpHost: string;
        smtpPort: number;
        smtpSecure: boolean;
        smtpUsername: string;
        smtpPassword: string;
        imapHost?: string;
        imapPort?: number;
        imapSecure?: boolean;
    }): Promise<{
        smtp: boolean;
        imap: boolean;
    }>;
}
