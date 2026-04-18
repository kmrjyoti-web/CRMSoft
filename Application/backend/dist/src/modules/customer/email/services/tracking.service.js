"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const uuid_1 = require("uuid");
let TrackingService = class TrackingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.baseUrl = process.env.EMAIL_TRACKING_BASE_URL || `${process.env.API_URL || 'http://localhost:3000'}/api`;
    }
    generateTrackingPixelId() {
        return (0, uuid_1.v4)();
    }
    injectOpenPixel(bodyHtml, trackingPixelId) {
        const pixel = `<img src="${this.baseUrl}/email/track/open/${trackingPixelId}" width="1" height="1" style="display:none" alt="" />`;
        if (bodyHtml.includes('</body>')) {
            return bodyHtml.replace('</body>', `${pixel}</body>`);
        }
        return bodyHtml + pixel;
    }
    rewriteLinks(bodyHtml, emailId) {
        return bodyHtml.replace(/<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi, (match, before, url, after) => {
            if (url.startsWith('mailto:') || url.startsWith('#') || url.includes('unsubscribe')) {
                return match;
            }
            const trackUrl = `${this.baseUrl}/email/track/click/${emailId}?url=${encodeURIComponent(url)}`;
            return `<a ${before}href="${trackUrl}"${after}>`;
        });
    }
    async recordOpen(trackingPixelId, ipAddress, userAgent) {
        const email = await this.prisma.working.email.findFirst({
            where: { trackingPixelId },
        });
        if (!email)
            return;
        const updateData = {
            openCount: { increment: 1 },
            lastOpenedAt: new Date(),
        };
        if (email.openCount === 0) {
            updateData.firstOpenedAt = new Date();
        }
        if (['SENT', 'DELIVERED'].includes(email.status)) {
            updateData.status = 'OPENED';
        }
        await this.prisma.working.email.update({ where: { id: email.id }, data: updateData });
        await this.prisma.working.emailTrackingEvent.create({
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
        if (email.campaignRecipientId) {
            await this.prisma.working.campaignRecipient.update({
                where: { id: email.campaignRecipientId },
                data: { openedAt: new Date(), openCount: { increment: 1 } },
            });
        }
        if (email.campaignId) {
            await this.prisma.working.emailCampaign.update({
                where: { id: email.campaignId },
                data: { openedCount: { increment: 1 } },
            });
        }
    }
    async recordClick(emailId, originalUrl, ipAddress, userAgent) {
        const email = await this.prisma.working.email.findUnique({ where: { id: emailId } });
        if (!email)
            return originalUrl;
        const updateData = {
            clickCount: { increment: 1 },
        };
        if (email.clickCount === 0) {
            updateData.firstClickedAt = new Date();
        }
        if (['SENT', 'DELIVERED', 'OPENED'].includes(email.status)) {
            updateData.status = 'CLICKED';
        }
        await this.prisma.working.email.update({ where: { id: emailId }, data: updateData });
        await this.prisma.working.emailTrackingEvent.create({
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
            await this.prisma.working.campaignRecipient.update({
                where: { id: email.campaignRecipientId },
                data: { clickedAt: new Date(), clickCount: { increment: 1 } },
            });
        }
        if (email.campaignId) {
            await this.prisma.working.emailCampaign.update({
                where: { id: email.campaignId },
                data: { clickedCount: { increment: 1 } },
            });
        }
        return originalUrl;
    }
    async recordBounce(emailId, reason) {
        await this.prisma.working.email.update({
            where: { id: emailId },
            data: { isBounced: true, bounceReason: reason, status: 'BOUNCED' },
        });
        const email = await this.prisma.working.email.findUnique({ where: { id: emailId } });
        if (!email)
            return;
        await this.prisma.working.emailTrackingEvent.create({
            data: { emailId, eventType: 'BOUNCE', campaignId: email.campaignId, recipientId: email.campaignRecipientId },
        });
        if (email.campaignId) {
            await this.prisma.working.emailCampaign.update({
                where: { id: email.campaignId },
                data: { bouncedCount: { increment: 1 } },
            });
        }
    }
    getTransparentPixel() {
        return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    }
    detectDeviceType(userAgent) {
        if (!userAgent)
            return 'UNKNOWN';
        const ua = userAgent.toLowerCase();
        if (/mobile|android|iphone|ipod/.test(ua))
            return 'MOBILE';
        if (/tablet|ipad/.test(ua))
            return 'TABLET';
        return 'DESKTOP';
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map