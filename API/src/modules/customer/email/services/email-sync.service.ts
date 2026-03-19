import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EmailProviderFactoryService } from './email-provider-factory.service';
import { ThreadBuilderService } from './thread-builder.service';
import { EmailLinkerService } from './email-linker.service';
import { EmailAccountStatus } from '@prisma/working-client';

@Injectable()
export class EmailSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: EmailProviderFactoryService,
    private readonly threadBuilder: ThreadBuilderService,
    private readonly linker: EmailLinkerService,
  ) {}

  async syncAccount(accountId: string): Promise<{ newEmails: number; errors: number }> {
    const account = await this.prisma.emailAccount.findUniqueOrThrow({
      where: { id: accountId },
    });

    if (account.status !== EmailAccountStatus.ACTIVE) {
      return { newEmails: 0, errors: 0 };
    }

    await this.prisma.emailAccount.update({
      where: { id: accountId },
      data: { status: 'SYNCING' },
    });

    let newEmails = 0;
    let errors = 0;

    try {
      const provider = this.providerFactory.getService(account.provider);
      const result = await provider.fetchEmails(accountId, {
        syncToken: account.syncToken || undefined,
        since: account.syncFromDate || undefined,
      });

      for (const fetched of result.emails) {
        try {
          // Dedup by internetMessageId
          if (fetched.internetMessageId) {
            const existing = await this.prisma.email.findFirst({
              where: { internetMessageId: fetched.internetMessageId },
            });
            if (existing) continue;
          }

          // Create email record
          const email = await this.prisma.email.create({
            data: {
              accountId,
              direction: 'INBOUND',
              fromEmail: fetched.from.email,
              fromName: fetched.from.name,
              toEmails: fetched.to,
              ccEmails: fetched.cc || [],
              subject: fetched.subject,
              bodyHtml: fetched.bodyHtml,
              bodyText: fetched.bodyText,
              snippet: fetched.snippet || fetched.bodyText?.slice(0, 200),
              providerMessageId: fetched.providerMessageId,
              providerThreadId: fetched.providerThreadId,
              internetMessageId: fetched.internetMessageId,
              inReplyToMessageId: fetched.inReplyTo,
              references: fetched.references || [],
              status: 'DELIVERED',
              sentAt: fetched.date,
              isRead: fetched.isRead || false,
              labels: fetched.labels || [],
              hasAttachments: (fetched.attachments?.length || 0) > 0,
              attachmentCount: fetched.attachments?.length || 0,
            },
          });

          // Create attachments
          if (fetched.attachments?.length) {
            await this.prisma.emailAttachment.createMany({
              data: fetched.attachments.map(a => ({
                emailId: email.id,
                fileName: a.fileName,
                mimeType: a.mimeType,
                fileSize: a.size,
                providerAttachmentId: a.attachmentId,
              })),
            });
          }

          // Thread assignment
          await this.threadBuilder.assignThread(email.id);

          // Auto-link to CRM entity
          if (account.autoLinkEnabled) {
            const participants = [fetched.from.email, ...fetched.to.map(t => t.email)];
            await this.linker.autoLink(email.id, participants);
          }

          newEmails++;
        } catch {
          errors++;
        }
      }

      // Update sync state
      await this.prisma.emailAccount.update({
        where: { id: accountId },
        data: {
          status: 'ACTIVE',
          lastSyncAt: new Date(),
          lastSyncError: null,
          syncToken: result.newSyncToken || account.syncToken,
          totalReceived: { increment: newEmails },
        },
      });
    } catch (error: any) {
      await this.prisma.emailAccount.update({
        where: { id: accountId },
        data: {
          status: 'ERROR',
          lastSyncError: error.message,
        },
      });
      throw error;
    }

    return { newEmails, errors };
  }

  async syncAllAccounts(): Promise<{ synced: number; failed: number }> {
    const accounts = await this.prisma.emailAccount.findMany({
      where: { syncEnabled: true, status: 'ACTIVE' },
    });

    let synced = 0;
    let failed = 0;

    for (const account of accounts) {
      try {
        await this.syncAccount(account.id);
        synced++;
      } catch {
        failed++;
      }
    }

    return { synced, failed };
  }
}
