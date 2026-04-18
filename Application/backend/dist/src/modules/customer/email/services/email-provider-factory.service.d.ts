import { EmailProvider } from '@prisma/working-client';
import { IEmailProviderService } from './email-provider.interface';
import { GmailService } from './gmail.service';
import { OutlookService } from './outlook.service';
import { ImapSmtpService } from './imap-smtp.service';
export declare class EmailProviderFactoryService {
    private readonly gmailService;
    private readonly outlookService;
    private readonly imapSmtpService;
    constructor(gmailService: GmailService, outlookService: OutlookService, imapSmtpService: ImapSmtpService);
    getService(provider: EmailProvider): IEmailProviderService;
}
