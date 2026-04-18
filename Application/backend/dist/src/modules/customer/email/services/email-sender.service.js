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
exports.EmailSenderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const email_provider_factory_service_1 = require("./email-provider-factory.service");
const tracking_service_1 = require("./tracking.service");
let EmailSenderService = class EmailSenderService {
    constructor(prisma, providerFactory, trackingService) {
        this.prisma = prisma;
        this.providerFactory = providerFactory;
        this.trackingService = trackingService;
    }
    async send(emailId) {
        const email = await this.prisma.working.email.findUniqueOrThrow({
            where: { id: emailId },
            include: { account: true, attachments: true },
        });
        const account = email.account;
        if (account.todaySentCount >= account.dailySendLimit) {
            throw new common_1.BadRequestException(`Daily send limit (${account.dailySendLimit}) reached for this account`);
        }
        const toEmails = email.toEmails.map(t => t.email);
        const unsubscribed = await this.prisma.working.emailUnsubscribe.findMany({
            where: { email: { in: toEmails } },
        });
        if (unsubscribed.length === toEmails.length) {
            await this.prisma.working.email.update({
                where: { id: emailId },
                data: { status: 'CANCELLED', errorMessage: 'All recipients are unsubscribed' },
            });
            return;
        }
        await this.prisma.working.email.update({ where: { id: emailId }, data: { status: 'SENDING' } });
        try {
            const providerService = this.providerFactory.getService(account.provider);
            const result = await providerService.sendEmail(account.id, {
                from: account.emailAddress,
                fromName: account.displayName || undefined,
                to: email.toEmails,
                cc: email.ccEmails || undefined,
                bcc: email.bccEmails || undefined,
                subject: email.subject,
                bodyHtml: email.bodyHtml || '',
                bodyText: email.bodyText || undefined,
                replyTo: email.replyToEmail || undefined,
                inReplyTo: email.inReplyToMessageId || undefined,
                references: email.references || undefined,
            });
            await this.prisma.working.email.update({
                where: { id: emailId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    providerMessageId: result.providerMessageId,
                    providerThreadId: result.threadId,
                    internetMessageId: result.messageId,
                },
            });
            await this.prisma.working.emailAccount.update({
                where: { id: account.id },
                data: {
                    todaySentCount: { increment: 1 },
                    totalSent: { increment: 1 },
                },
            });
        }
        catch (error) {
            const retryCount = email.retryCount + 1;
            await this.prisma.working.email.update({
                where: { id: emailId },
                data: {
                    status: retryCount < 3 ? 'QUEUED' : 'FAILED',
                    errorMessage: error.message,
                    retryCount,
                },
            });
        }
    }
    async processScheduledEmails() {
        const emails = await this.prisma.working.email.findMany({
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
            }
            catch {
            }
        }
        return sent;
    }
};
exports.EmailSenderService = EmailSenderService;
exports.EmailSenderService = EmailSenderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_provider_factory_service_1.EmailProviderFactoryService,
        tracking_service_1.TrackingService])
], EmailSenderService);
//# sourceMappingURL=email-sender.service.js.map