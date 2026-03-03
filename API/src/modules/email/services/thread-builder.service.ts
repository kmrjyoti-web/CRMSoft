import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class ThreadBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async assignThread(emailId: string): Promise<string | null> {
    const email = await this.prisma.email.findUniqueOrThrow({ where: { id: emailId } });

    let threadId: string | null = null;

    // 1. Check providerThreadId
    if (email.providerThreadId) {
      const existing = await this.prisma.emailThread.findFirst({
        where: { providerThreadId: email.providerThreadId },
      });
      if (existing) threadId = existing.id;
    }

    // 2. Check inReplyToMessageId
    if (!threadId && email.inReplyToMessageId) {
      const parent = await this.prisma.email.findFirst({
        where: { internetMessageId: email.inReplyToMessageId },
      });
      if (parent?.threadId) threadId = parent.threadId;
    }

    // 3. Check References header
    if (!threadId && email.references.length > 0) {
      const referenced = await this.prisma.email.findFirst({
        where: { internetMessageId: { in: email.references } },
      });
      if (referenced?.threadId) threadId = referenced.threadId;
    }

    // 4. Match by normalized subject
    if (!threadId) {
      const normalized = this.normalizeSubject(email.subject);
      const existingThread = await this.prisma.emailThread.findFirst({
        where: { subject: normalized },
        orderBy: { lastMessageAt: 'desc' },
      });
      if (existingThread) threadId = existingThread.id;
    }

    // 5. Create new thread if none found
    if (!threadId) {
      const allEmails = this.collectParticipants(email);
      const thread = await this.prisma.emailThread.create({
        data: {
          subject: this.normalizeSubject(email.subject),
          participantEmails: allEmails,
          messageCount: 1,
          lastMessageAt: email.sentAt || email.createdAt,
          lastMessageSnippet: email.snippet,
          providerThreadId: email.providerThreadId,
          linkedEntityType: email.linkedEntityType,
          linkedEntityId: email.linkedEntityId,
        },
      });
      threadId = thread.id;
    } else {
      // Update existing thread
      await this.prisma.emailThread.update({
        where: { id: threadId },
        data: {
          messageCount: { increment: 1 },
          lastMessageAt: email.sentAt || email.createdAt,
          lastMessageSnippet: email.snippet,
        },
      });
    }

    // Set thread on email
    await this.prisma.email.update({
      where: { id: emailId },
      data: { threadId },
    });

    return threadId;
  }

  normalizeSubject(subject: string): string {
    return subject.replace(/^(Re|Fwd|Fw|RE|FW|FWD):\s*/gi, '').trim();
  }

  private collectParticipants(email: any): string[] {
    const emails = new Set<string>();
    emails.add(email.fromEmail);
    for (const to of (email.toEmails as any[]) || []) {
      emails.add(to.email);
    }
    for (const cc of (email.ccEmails as any[]) || []) {
      emails.add(cc.email);
    }
    return Array.from(emails);
  }
}
