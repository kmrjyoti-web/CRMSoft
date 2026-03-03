import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ComposeEmailCommand } from './compose-email.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TemplateRendererService } from '../../../services/template-renderer.service';
import { TrackingService } from '../../../services/tracking.service';
import { EmailSenderService } from '../../../services/email-sender.service';

@CommandHandler(ComposeEmailCommand)
export class ComposeEmailHandler implements ICommandHandler<ComposeEmailCommand> {
  private readonly logger = new Logger(ComposeEmailHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly trackingService: TrackingService,
    private readonly emailSender: EmailSenderService,
  ) {}

  async execute(cmd: ComposeEmailCommand) {
    let subject = cmd.subject;
    let bodyHtml = cmd.bodyHtml;
    let bodyText = cmd.bodyText;

    // 1. If templateId -> render template
    if (cmd.templateId) {
      const template = await this.prisma.emailTemplate.findUniqueOrThrow({
        where: { id: cmd.templateId },
      });
      const data = cmd.templateData || {};
      subject = this.templateRenderer.render(template.subject, data);
      bodyHtml = this.templateRenderer.render(template.bodyHtml, data);
      if (template.bodyText) {
        bodyText = this.templateRenderer.render(template.bodyText, data);
      }
    }

    // 2. If signatureId -> append signature
    if (cmd.signatureId) {
      const signature = await this.prisma.emailSignature.findUniqueOrThrow({
        where: { id: cmd.signatureId },
      });
      bodyHtml = bodyHtml + '<br/><div class="email-signature">' + signature.bodyHtml + '</div>';
    }

    // 3. Generate tracking pixel ID if tracking enabled
    let trackingPixelId: string | null = null;
    if (cmd.trackOpens || cmd.trackClicks) {
      trackingPixelId = this.trackingService.generateTrackingPixelId();
    }

    // Determine email status
    let status: string;
    if (cmd.sendNow) {
      status = 'QUEUED';
    } else if (cmd.scheduledAt) {
      status = 'QUEUED';
    } else {
      status = 'DRAFT';
    }

    // 6. Create email record
    const account = await this.prisma.emailAccount.findUniqueOrThrow({
      where: { id: cmd.accountId },
    });

    const email = await this.prisma.email.create({
      data: {
        accountId: cmd.accountId,
        direction: 'OUTBOUND',
        fromEmail: account.emailAddress,
        fromName: account.displayName,
        toEmails: cmd.to,
        ccEmails: cmd.cc || [],
        bccEmails: cmd.bcc || [],
        subject,
        bodyHtml,
        bodyText,
        status: status as any,
        priority: cmd.priority as any,
        scheduledAt: cmd.scheduledAt,
        replyToEmail: cmd.replyToEmailId,
        trackingEnabled: cmd.trackOpens || cmd.trackClicks || false,
        trackingPixelId,
        linkedEntityType: cmd.entityType || null,
        linkedEntityId: cmd.entityId || null,
      },
    });

    // 4. If trackOpens -> inject pixel
    if (cmd.trackOpens && trackingPixelId) {
      bodyHtml = this.trackingService.injectOpenPixel(bodyHtml, trackingPixelId);
    }

    // 5. If trackClicks -> rewrite links
    if (cmd.trackClicks) {
      bodyHtml = this.trackingService.rewriteLinks(bodyHtml, email.id);
    }

    // Update body if tracking modified it
    if (cmd.trackOpens || cmd.trackClicks) {
      await this.prisma.email.update({
        where: { id: email.id },
        data: { bodyHtml },
      });
    }

    // 8. If sendNow -> send immediately
    if (cmd.sendNow) {
      await this.emailSender.send(email.id);
    }

    this.logger.log(`Email composed: ${email.id} (status: ${status})`);
    return email;
  }
}
