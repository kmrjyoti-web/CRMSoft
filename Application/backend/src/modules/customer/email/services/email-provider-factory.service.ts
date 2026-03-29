import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailProvider } from '@prisma/working-client';
import { IEmailProviderService } from './email-provider.interface';
import { GmailService } from './gmail.service';
import { OutlookService } from './outlook.service';
import { ImapSmtpService } from './imap-smtp.service';

@Injectable()
export class EmailProviderFactoryService {
  constructor(
    private readonly gmailService: GmailService,
    private readonly outlookService: OutlookService,
    private readonly imapSmtpService: ImapSmtpService,
  ) {}

  getService(provider: EmailProvider): IEmailProviderService {
    switch (provider) {
      case EmailProvider.GMAIL:
        return this.gmailService;
      case EmailProvider.OUTLOOK:
        return this.outlookService;
      case EmailProvider.IMAP_SMTP:
      case EmailProvider.ORGANIZATION_SMTP:
        return this.imapSmtpService;
      default:
        throw new BadRequestException(`Unsupported email provider: ${provider}`);
    }
  }
}
