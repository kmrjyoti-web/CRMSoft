import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TemplateRendererService } from './template-renderer.service';
import { TrackingService } from './tracking.service';
import { EmailSenderService } from './email-sender.service';
import { CampaignStatus } from '@prisma/working-client';

@Injectable()
export class CampaignExecutorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly trackingService: TrackingService,
    private readonly emailSender: EmailSenderService,
  ) {}

  async executeCampaign(campaignId: string): Promise<void> {
    const campaign = await this.prisma.working.emailCampaign.findUniqueOrThrow({
      where: { id: campaignId },
    });

    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException(`Campaign is in ${campaign.status} status, cannot start`);
    }

    await this.prisma.working.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', startedAt: new Date() },
    });

    try {
      const recipients = await this.prisma.working.campaignRecipient.findMany({
        where: { campaignId, status: 'PENDING' },
      });

      // Check for unsubscribes
      const recipientEmails = recipients.map(r => r.email);
      const unsubscribed = await this.prisma.working.emailUnsubscribe.findMany({
        where: { email: { in: recipientEmails } },
      });
      const unsubscribedEmails = new Set(unsubscribed.map(u => u.email));

      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        // Check if campaign was paused/cancelled
        const current = await this.prisma.working.emailCampaign.findUnique({ where: { id: campaignId } });
        if (current?.status === 'PAUSED' || current?.status === 'CANCELLED') break;

        if (unsubscribedEmails.has(recipient.email)) {
          await this.prisma.working.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
          });
          continue;
        }

        try {
          const mergeData = (recipient.mergeData as Record<string, any>) || {};
          mergeData.firstName = mergeData.firstName || recipient.firstName || '';
          mergeData.lastName = mergeData.lastName || recipient.lastName || '';
          mergeData.company = mergeData.company || recipient.companyName || '';

          const subject = this.templateRenderer.render(campaign.subject, mergeData);
          let bodyHtml = this.templateRenderer.render(campaign.bodyHtml, mergeData);

          const trackingPixelId = this.trackingService.generateTrackingPixelId();

          // Create email record
          const email = await this.prisma.working.email.create({
            data: {
              accountId: campaign.accountId,
              direction: 'OUTBOUND',
              fromEmail: campaign.fromName ? `${campaign.fromName}` : '',
              fromName: campaign.fromName,
              toEmails: [{ email: recipient.email, name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() }],
              subject,
              bodyHtml,
              status: 'QUEUED',
              campaignId,
              campaignRecipientId: recipient.id,
              trackingEnabled: campaign.trackOpens || campaign.trackClicks,
              trackingPixelId: campaign.trackOpens ? trackingPixelId : null,
              replyToEmail: campaign.replyToEmail,
            },
          });

          // Inject tracking
          if (campaign.trackOpens) {
            bodyHtml = this.trackingService.injectOpenPixel(bodyHtml, trackingPixelId);
          }
          if (campaign.trackClicks) {
            bodyHtml = this.trackingService.rewriteLinks(bodyHtml, email.id);
          }

          // Update email with tracking-enhanced body
          await this.prisma.working.email.update({
            where: { id: email.id },
            data: { bodyHtml },
          });

          // Send
          await this.emailSender.send(email.id);

          await this.prisma.working.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'SENT', sentAt: new Date(), emailId: email.id },
          });

          sentCount++;
        } catch (error: any) {
          await this.prisma.working.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'FAILED', failedAt: new Date(), errorMessage: error.message },
          });
          failedCount++;
        }

        // Throttle: wait between emails
        if (campaign.sendRatePerMinute > 0) {
          const delayMs = Math.ceil(60000 / campaign.sendRatePerMinute);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      // Update campaign
      const finalStatus = failedCount === recipients.length ? 'FAILED' : 'COMPLETED';
      await this.prisma.working.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          sentCount,
          failedCount,
        },
      });
    } catch (error: any) {
      await this.prisma.working.emailCampaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED', errorMessage: error.message },
      });
    }
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    await this.prisma.working.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' },
    });
  }

  async cancelCampaign(campaignId: string): Promise<void> {
    await this.prisma.working.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' },
    });
    // Cancel pending recipients
    await this.prisma.working.campaignRecipient.updateMany({
      where: { campaignId, status: 'PENDING' },
      data: { status: 'FAILED', errorMessage: 'Campaign cancelled' },
    });
  }
}
