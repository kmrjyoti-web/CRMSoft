import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmailProvider } from '@prisma/working-client';
import { EmailProviderFactoryService } from '../services/email-provider-factory.service';
import { GmailService } from '../services/gmail.service';
import { OutlookService } from '../services/outlook.service';
import { ImapSmtpService } from '../services/imap-smtp.service';

describe('EmailProviderFactoryService', () => {
  let service: EmailProviderFactoryService;
  let gmailService: any;
  let outlookService: any;
  let imapSmtpService: any;

  beforeEach(async () => {
    gmailService = { sendEmail: jest.fn(), fetchEmails: jest.fn() };
    outlookService = { sendEmail: jest.fn(), fetchEmails: jest.fn() };
    imapSmtpService = { sendEmail: jest.fn(), fetchEmails: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProviderFactoryService,
        { provide: GmailService, useValue: gmailService },
        { provide: OutlookService, useValue: outlookService },
        { provide: ImapSmtpService, useValue: imapSmtpService },
      ],
    }).compile();

    service = module.get<EmailProviderFactoryService>(EmailProviderFactoryService);
  });

  it('should return GmailService for GMAIL provider', () => {
    const result = service.getService(EmailProvider.GMAIL);

    expect(result).toBe(gmailService);
  });

  it('should return OutlookService for OUTLOOK provider', () => {
    const result = service.getService(EmailProvider.OUTLOOK);

    expect(result).toBe(outlookService);
  });

  it('should return ImapSmtpService for IMAP_SMTP provider', () => {
    const result = service.getService(EmailProvider.IMAP_SMTP);

    expect(result).toBe(imapSmtpService);
  });

  it('should throw BadRequestException for unsupported provider', () => {
    expect(() => service.getService('UNKNOWN' as any)).toThrow(BadRequestException);
  });
});
