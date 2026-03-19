import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { ReplyEmailCommand } from './reply-email.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ReplyEmailCommand)
export class ReplyEmailHandler implements ICommandHandler<ReplyEmailCommand> {
  private readonly logger = new Logger(ReplyEmailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ReplyEmailCommand) {
    const original = await this.prisma.email.findUnique({
      where: { id: cmd.originalEmailId },
      include: { account: true },
    });

    if (!original) {
      throw new NotFoundException(`Email ${cmd.originalEmailId} not found`);
    }

    // Determine subject prefix
    let subjectPrefix: string;
    if (cmd.replyType === 'FORWARD') {
      subjectPrefix = 'Fwd:';
    } else {
      subjectPrefix = 'Re:';
    }

    // Strip existing Re:/Fwd: prefixes before adding new one
    const cleanSubject = original.subject.replace(/^(Re:|Fwd:)\s*/i, '');
    const subject = `${subjectPrefix} ${cleanSubject}`;

    // Determine recipients
    let toEmails: any[];
    if (cmd.replyType === 'FORWARD') {
      toEmails = cmd.to || [];
    } else if (cmd.replyType === 'REPLY_ALL') {
      // Reply to sender + all original recipients, excluding self
      const originalTo = (original.toEmails as any[]) || [];
      const originalCc = (original.ccEmails as any[]) || [];
      const allRecipients = [
        { email: original.fromEmail, name: original.fromName },
        ...originalTo,
        ...originalCc,
      ].filter(r => r.email !== original.account.emailAddress);
      toEmails = cmd.to || allRecipients;
    } else {
      // REPLY - reply to sender only
      toEmails = cmd.to || [{ email: original.fromEmail, name: original.fromName }];
    }

    // Build references chain
    const existingRefs = (original.references as string[]) || [];
    const references = original.internetMessageId
      ? [...existingRefs, original.internetMessageId]
      : existingRefs;

    const email = await this.prisma.email.create({
      data: {
        accountId: original.accountId,
        direction: 'OUTBOUND',
        fromEmail: original.account.emailAddress,
        fromName: original.account.displayName,
        toEmails: toEmails,
        subject,
        bodyHtml: cmd.bodyHtml,
        bodyText: cmd.bodyText,
        status: 'DRAFT',
        replyToEmail: original.fromEmail,
        inReplyToMessageId: original.internetMessageId,
        references,
        threadId: original.threadId,
      },
    });

    this.logger.log(`Reply email created: ${email.id} (type: ${cmd.replyType}) to original: ${cmd.originalEmailId}`);
    return email;
  }
}
