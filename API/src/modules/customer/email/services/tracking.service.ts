import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TrackingService {
  private readonly baseUrl: string;

  constructor(private readonly prisma: PrismaService) {
    this.baseUrl = process.env.EMAIL_TRACKING_BASE_URL || `${process.env.API_URL || 'http://localhost:3000'}/api`;
  }

  generateTrackingPixelId(): string {
    return uuidv4();
  }

  injectOpenPixel(bodyHtml: string, trackingPixelId: string): string {
    const pixel = `<img src="${this.baseUrl}/email/track/open/${trackingPixelId}" width="1" height="1" style="display:none" alt="" />`;

    if (bodyHtml.includes('</body>')) {
      return bodyHtml.replace('</body>', `${pixel}</body>`);
    }
    return bodyHtml + pixel;
  }

  rewriteLinks(bodyHtml: string, emailId: string): string {
    return bodyHtml.replace(
      /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
      (match, before, url, after) => {
        // Skip mailto:, anchors, and unsubscribe links
        if (url.startsWith('mailto:') || url.startsWith('#') || url.includes('unsubscribe')) {
          return match;
        }
        const trackUrl = `${this.baseUrl}/email/track/click/${emailId}?url=${encodeURIComponent(url)}`;
        return `<a ${before}href="${trackUrl}"${after}>`;
      },
    );
  }

  async recordOpen(trackingPixelId: string, ipAddress?: string, userAgent?: string) {
    const email = await this.prisma.email.findFirst({
      where: { trackingPixelId },
    });
    if (!email) return;

    const updateData: any = {
      openCount: { increment: 1 },
      lastOpenedAt: new Date(),
    };

    if (email.openCount === 0) {
      updateData.firstOpenedAt = new Date();
    }

    if (['SENT', 'DELIVERED'].includes(email.status)) {
      updateData.status = 'OPENED';
    }

    await this.prisma.email.update({ where: { id: email.id }, data: updateData });

    await this.prisma.emailTrackingEvent.create({
      data: {
        emailId: email.id,
        eventType: 'OPEN',
        ipAddress,
        userAgent,
        deviceType: this.detectDeviceType(userAgent),
        campaignId: email.campaignId,
        recipientId: email.campaignRecipientId,
      },
    });

    // Update campaign recipient if applicable
    if (email.campaignRecipientId) {
      await this.prisma.campaignRecipient.update({
        where: { id: email.campaignRecipientId },
        data: { openedAt: new Date(), openCount: { increment: 1 } },
      });
    }
    if (email.campaignId) {
      await this.prisma.emailCampaign.update({
        where: { id: email.campaignId },
        data: { openedCount: { increment: 1 } },
      });
    }
  }

  async recordClick(emailId: string, originalUrl: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const email = await this.prisma.email.findUnique({ where: { id: emailId } });
    if (!email) return originalUrl;

    const updateData: any = {
      clickCount: { increment: 1 },
    };
    if (email.clickCount === 0) {
      updateData.firstClickedAt = new Date();
    }
    if (['SENT', 'DELIVERED', 'OPENED'].includes(email.status)) {
      updateData.status = 'CLICKED';
    }

    await this.prisma.email.update({ where: { id: emailId }, data: updateData });

    await this.prisma.emailTrackingEvent.create({
      data: {
        emailId,
        eventType: 'CLICK',
        clickedUrl: originalUrl,
        ipAddress,
        userAgent,
        deviceType: this.detectDeviceType(userAgent),
        campaignId: email.campaignId,
        recipientId: email.campaignRecipientId,
      },
    });

    if (email.campaignRecipientId) {
      await this.prisma.campaignRecipient.update({
        where: { id: email.campaignRecipientId },
        data: { clickedAt: new Date(), clickCount: { increment: 1 } },
      });
    }
    if (email.campaignId) {
      await this.prisma.emailCampaign.update({
        where: { id: email.campaignId },
        data: { clickedCount: { increment: 1 } },
      });
    }

    return originalUrl;
  }

  async recordBounce(emailId: string, reason: string) {
    await this.prisma.email.update({
      where: { id: emailId },
      data: { isBounced: true, bounceReason: reason, status: 'BOUNCED' },
    });

    const email = await this.prisma.email.findUnique({ where: { id: emailId } });
    if (!email) return;

    await this.prisma.emailTrackingEvent.create({
      data: { emailId, eventType: 'BOUNCE', campaignId: email.campaignId, recipientId: email.campaignRecipientId },
    });

    if (email.campaignId) {
      await this.prisma.emailCampaign.update({
        where: { id: email.campaignId },
        data: { bouncedCount: { increment: 1 } },
      });
    }
  }

  // 1×1 transparent GIF pixel
  getTransparentPixel(): Buffer {
    return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  }

  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'UNKNOWN';
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod/.test(ua)) return 'MOBILE';
    if (/tablet|ipad/.test(ua)) return 'TABLET';
    return 'DESKTOP';
  }
}
