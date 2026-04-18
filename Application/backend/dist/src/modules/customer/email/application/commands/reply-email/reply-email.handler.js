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
var ReplyEmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyEmailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reply_email_command_1 = require("./reply-email.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ReplyEmailHandler = ReplyEmailHandler_1 = class ReplyEmailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ReplyEmailHandler_1.name);
    }
    async execute(cmd) {
        try {
            const original = await this.prisma.working.email.findUnique({
                where: { id: cmd.originalEmailId },
                include: { account: true },
            });
            if (!original) {
                throw new common_1.NotFoundException(`Email ${cmd.originalEmailId} not found`);
            }
            let subjectPrefix;
            if (cmd.replyType === 'FORWARD') {
                subjectPrefix = 'Fwd:';
            }
            else {
                subjectPrefix = 'Re:';
            }
            const cleanSubject = original.subject.replace(/^(Re:|Fwd:)\s*/i, '');
            const subject = `${subjectPrefix} ${cleanSubject}`;
            let toEmails;
            if (cmd.replyType === 'FORWARD') {
                toEmails = cmd.to || [];
            }
            else if (cmd.replyType === 'REPLY_ALL') {
                const originalTo = original.toEmails || [];
                const originalCc = original.ccEmails || [];
                const allRecipients = [
                    { email: original.fromEmail, name: original.fromName },
                    ...originalTo,
                    ...originalCc,
                ].filter(r => r.email !== original.account.emailAddress);
                toEmails = cmd.to || allRecipients;
            }
            else {
                toEmails = cmd.to || [{ email: original.fromEmail, name: original.fromName }];
            }
            const existingRefs = original.references || [];
            const references = original.internetMessageId
                ? [...existingRefs, original.internetMessageId]
                : existingRefs;
            const email = await this.prisma.working.email.create({
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
        catch (error) {
            this.logger.error(`ReplyEmailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReplyEmailHandler = ReplyEmailHandler;
exports.ReplyEmailHandler = ReplyEmailHandler = ReplyEmailHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reply_email_command_1.ReplyEmailCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReplyEmailHandler);
//# sourceMappingURL=reply-email.handler.js.map