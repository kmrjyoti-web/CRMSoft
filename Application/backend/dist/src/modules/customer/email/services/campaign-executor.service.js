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
exports.CampaignExecutorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const template_renderer_service_1 = require("./template-renderer.service");
const tracking_service_1 = require("./tracking.service");
const email_sender_service_1 = require("./email-sender.service");
const working_client_1 = require("@prisma/working-client");
let CampaignExecutorService = class CampaignExecutorService {
    constructor(prisma, templateRenderer, trackingService, emailSender) {
        this.prisma = prisma;
        this.templateRenderer = templateRenderer;
        this.trackingService = trackingService;
        this.emailSender = emailSender;
    }
    async executeCampaign(campaignId) {
        const campaign = await this.prisma.working.emailCampaign.findUniqueOrThrow({
            where: { id: campaignId },
        });
        if (campaign.status !== working_client_1.CampaignStatus.DRAFT && campaign.status !== working_client_1.CampaignStatus.SCHEDULED) {
            throw new common_1.BadRequestException(`Campaign is in ${campaign.status} status, cannot start`);
        }
        await this.prisma.working.emailCampaign.update({
            where: { id: campaignId },
            data: { status: 'SENDING', startedAt: new Date() },
        });
        try {
            const recipients = await this.prisma.working.campaignRecipient.findMany({
                where: { campaignId, status: 'PENDING' },
            });
            const recipientEmails = recipients.map(r => r.email);
            const unsubscribed = await this.prisma.working.emailUnsubscribe.findMany({
                where: { email: { in: recipientEmails } },
            });
            const unsubscribedEmails = new Set(unsubscribed.map(u => u.email));
            let sentCount = 0;
            let failedCount = 0;
            for (const recipient of recipients) {
                const current = await this.prisma.working.emailCampaign.findUnique({ where: { id: campaignId } });
                if (current?.status === 'PAUSED' || current?.status === 'CANCELLED')
                    break;
                if (unsubscribedEmails.has(recipient.email)) {
                    await this.prisma.working.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
                    });
                    continue;
                }
                try {
                    const mergeData = recipient.mergeData || {};
                    mergeData.firstName = mergeData.firstName || recipient.firstName || '';
                    mergeData.lastName = mergeData.lastName || recipient.lastName || '';
                    mergeData.company = mergeData.company || recipient.companyName || '';
                    const subject = this.templateRenderer.render(campaign.subject, mergeData);
                    let bodyHtml = this.templateRenderer.render(campaign.bodyHtml, mergeData);
                    const trackingPixelId = this.trackingService.generateTrackingPixelId();
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
                    if (campaign.trackOpens) {
                        bodyHtml = this.trackingService.injectOpenPixel(bodyHtml, trackingPixelId);
                    }
                    if (campaign.trackClicks) {
                        bodyHtml = this.trackingService.rewriteLinks(bodyHtml, email.id);
                    }
                    await this.prisma.working.email.update({
                        where: { id: email.id },
                        data: { bodyHtml },
                    });
                    await this.emailSender.send(email.id);
                    await this.prisma.working.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date(), emailId: email.id },
                    });
                    sentCount++;
                }
                catch (error) {
                    await this.prisma.working.campaignRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', failedAt: new Date(), errorMessage: error.message },
                    });
                    failedCount++;
                }
                if (campaign.sendRatePerMinute > 0) {
                    const delayMs = Math.ceil(60000 / campaign.sendRatePerMinute);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
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
        }
        catch (error) {
            await this.prisma.working.emailCampaign.update({
                where: { id: campaignId },
                data: { status: 'FAILED', errorMessage: error.message },
            });
        }
    }
    async pauseCampaign(campaignId) {
        await this.prisma.working.emailCampaign.update({
            where: { id: campaignId },
            data: { status: 'PAUSED' },
        });
    }
    async cancelCampaign(campaignId) {
        await this.prisma.working.emailCampaign.update({
            where: { id: campaignId },
            data: { status: 'CANCELLED' },
        });
        await this.prisma.working.campaignRecipient.updateMany({
            where: { campaignId, status: 'PENDING' },
            data: { status: 'FAILED', errorMessage: 'Campaign cancelled' },
        });
    }
};
exports.CampaignExecutorService = CampaignExecutorService;
exports.CampaignExecutorService = CampaignExecutorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_renderer_service_1.TemplateRendererService,
        tracking_service_1.TrackingService,
        email_sender_service_1.EmailSenderService])
], CampaignExecutorService);
//# sourceMappingURL=campaign-executor.service.js.map