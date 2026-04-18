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
var ComposeEmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposeEmailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const compose_email_command_1 = require("./compose-email.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const template_renderer_service_1 = require("../../../services/template-renderer.service");
const tracking_service_1 = require("../../../services/tracking.service");
const email_sender_service_1 = require("../../../services/email-sender.service");
let ComposeEmailHandler = ComposeEmailHandler_1 = class ComposeEmailHandler {
    constructor(prisma, templateRenderer, trackingService, emailSender) {
        this.prisma = prisma;
        this.templateRenderer = templateRenderer;
        this.trackingService = trackingService;
        this.emailSender = emailSender;
        this.logger = new common_1.Logger(ComposeEmailHandler_1.name);
    }
    async execute(cmd) {
        try {
            let subject = cmd.subject;
            let bodyHtml = cmd.bodyHtml;
            let bodyText = cmd.bodyText;
            if (cmd.templateId) {
                const template = await this.prisma.working.emailTemplate.findUniqueOrThrow({
                    where: { id: cmd.templateId },
                });
                const data = cmd.templateData || {};
                subject = this.templateRenderer.render(template.subject, data);
                bodyHtml = this.templateRenderer.render(template.bodyHtml, data);
                if (template.bodyText) {
                    bodyText = this.templateRenderer.render(template.bodyText, data);
                }
            }
            if (cmd.signatureId) {
                const signature = await this.prisma.working.emailSignature.findUniqueOrThrow({
                    where: { id: cmd.signatureId },
                });
                bodyHtml = bodyHtml + '<br/><div class="email-signature">' + signature.bodyHtml + '</div>';
            }
            let trackingPixelId = null;
            if (cmd.trackOpens || cmd.trackClicks) {
                trackingPixelId = this.trackingService.generateTrackingPixelId();
            }
            let status;
            if (cmd.sendNow) {
                status = 'QUEUED';
            }
            else if (cmd.scheduledAt) {
                status = 'QUEUED';
            }
            else {
                status = 'DRAFT';
            }
            const account = await this.prisma.working.emailAccount.findUniqueOrThrow({
                where: { id: cmd.accountId },
            });
            const email = await this.prisma.working.email.create({
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
                    status: status,
                    priority: cmd.priority,
                    scheduledAt: cmd.scheduledAt,
                    replyToEmail: cmd.replyToEmailId,
                    trackingEnabled: cmd.trackOpens || cmd.trackClicks || false,
                    trackingPixelId,
                    linkedEntityType: cmd.entityType || null,
                    linkedEntityId: cmd.entityId || null,
                },
            });
            if (cmd.trackOpens && trackingPixelId) {
                bodyHtml = this.trackingService.injectOpenPixel(bodyHtml, trackingPixelId);
            }
            if (cmd.trackClicks) {
                bodyHtml = this.trackingService.rewriteLinks(bodyHtml, email.id);
            }
            if (cmd.trackOpens || cmd.trackClicks) {
                await this.prisma.working.email.update({
                    where: { id: email.id },
                    data: { bodyHtml },
                });
            }
            if (cmd.sendNow) {
                await this.emailSender.send(email.id);
            }
            this.logger.log(`Email composed: ${email.id} (status: ${status})`);
            return email;
        }
        catch (error) {
            this.logger.error(`ComposeEmailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ComposeEmailHandler = ComposeEmailHandler;
exports.ComposeEmailHandler = ComposeEmailHandler = ComposeEmailHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(compose_email_command_1.ComposeEmailCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_renderer_service_1.TemplateRendererService,
        tracking_service_1.TrackingService,
        email_sender_service_1.EmailSenderService])
], ComposeEmailHandler);
//# sourceMappingURL=compose-email.handler.js.map