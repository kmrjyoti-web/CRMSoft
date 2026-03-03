import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EmailProviderFactoryService } from './email-provider-factory.service';
import { TrackingService } from './tracking.service';

@Injectable()
export class EmailSenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: EmailProviderFactoryService,
    private readonly trackingService: TrackingService,
  ) {}

  async send(emailId: string): Promise<void> {
    const email = await this.prisma.email.findUniqueOrThrow({
      where: { id: emailId },
      include: { account: true, attachments: true },
    });

    // Check daily limit
    const account = email.account;
    if (account.todaySentCount >= account.dailySendLimit) {
      throw new BadRequestException(`Daily send limit (${account.dailySendLimit}) reached for this account`);
    }

    // Check unsubscribes
    const toEmails = (email.toEmails as any[]).map(t => t.email);
    const unsubscribed = await this.prisma.emailUnsubscribe.findMany({
      where: { email: { in: toEmails } },
    });
    if (unsubscribed.length === toEmails.length) {
      await this.prisma.email.update({
        where: { id: emailId },
        data: { status: 'CANCELLED', errorMessage: 'All recipients are unsubscribed' },
      });
      return;
    }

    // Update status to SENDING
    await this.prisma.email.update({ where: { id: emailId }, data: { status: 'SENDING' } });

    try {
      const providerService = this.providerFactory.getService(account.provider);

      const result = await providerService.sendEmail(account.id, {
        from: account.emailAddress,
        fromName: account.displayName || undefined,
        to: email.toEmails as any[],
        cc: email.ccEmails as any[] || undefined,
        bcc: email.bccEmails as any[] || undefined,
        subject: email.subject,
        bodyHtml: email.bodyHtml || '',
        bodyText: email.bodyText || undefined,
        replyTo: email.replyToEmail || undefined,
        inReplyTo: email.inReplyToMessageId || undefined,
        references: email.references || undefined,
      });

      // Success
      await this.prisma.email.update({
        where: { id: emailId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          providerMessageId: result.providerMessageId,
          providerThreadId: result.threadId,
          internetMessageId: result.messageId,
        },
      });

      // Update account counters
      await this.prisma.emailAccount.update({
        where: { id: account.id },
        data: {
          todaySentCount: { increment: 1 },
          totalSent: { increment: 1 },
        },
      });
    } catch (error: any) {
      const retryCount = email.retryCount + 1;
      await this.prisma.email.update({
        where: { id: emailId },
        data: {
          status: retryCount < 3 ? 'QUEUED' : 'FAILED',
          errorMessage: error.message,
          retryCount,
        },
      });
    }
  }

  async processScheduledEmails(): Promise<number> {
    const emails = await this.prisma.email.findMany({
      where: {
        status: 'QUEUED',
        scheduledAt: { lte: new Date() },
      },
      take: 50,
    });

    let sent = 0;
    for (const email of emails) {
      try {
        await this.send(email.id);
        sent++;
      } catch {
        // Individual email errors handled in send()
      }
    }
    return sent;
  }
}
