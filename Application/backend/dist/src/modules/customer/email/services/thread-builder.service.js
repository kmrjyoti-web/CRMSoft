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
exports.ThreadBuilderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ThreadBuilderService = class ThreadBuilderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assignThread(emailId) {
        const email = await this.prisma.working.email.findUniqueOrThrow({ where: { id: emailId } });
        let threadId = null;
        if (email.providerThreadId) {
            const existing = await this.prisma.working.emailThread.findFirst({
                where: { providerThreadId: email.providerThreadId },
            });
            if (existing)
                threadId = existing.id;
        }
        if (!threadId && email.inReplyToMessageId) {
            const parent = await this.prisma.working.email.findFirst({
                where: { internetMessageId: email.inReplyToMessageId },
            });
            if (parent?.threadId)
                threadId = parent.threadId;
        }
        if (!threadId && email.references.length > 0) {
            const referenced = await this.prisma.working.email.findFirst({
                where: { internetMessageId: { in: email.references } },
            });
            if (referenced?.threadId)
                threadId = referenced.threadId;
        }
        if (!threadId) {
            const normalized = this.normalizeSubject(email.subject);
            const existingThread = await this.prisma.working.emailThread.findFirst({
                where: { subject: normalized },
                orderBy: { lastMessageAt: 'desc' },
            });
            if (existingThread)
                threadId = existingThread.id;
        }
        if (!threadId) {
            const allEmails = this.collectParticipants(email);
            const thread = await this.prisma.working.emailThread.create({
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
        }
        else {
            await this.prisma.working.emailThread.update({
                where: { id: threadId },
                data: {
                    messageCount: { increment: 1 },
                    lastMessageAt: email.sentAt || email.createdAt,
                    lastMessageSnippet: email.snippet,
                },
            });
        }
        await this.prisma.working.email.update({
            where: { id: emailId },
            data: { threadId },
        });
        return threadId;
    }
    normalizeSubject(subject) {
        return subject.replace(/^(Re|Fwd|Fw|RE|FW|FWD):\s*/gi, '').trim();
    }
    collectParticipants(email) {
        const emails = new Set();
        emails.add(email.fromEmail);
        for (const to of email.toEmails || []) {
            emails.add(to.email);
        }
        for (const cc of email.ccEmails || []) {
            emails.add(cc.email);
        }
        return Array.from(emails);
    }
};
exports.ThreadBuilderService = ThreadBuilderService;
exports.ThreadBuilderService = ThreadBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ThreadBuilderService);
//# sourceMappingURL=thread-builder.service.js.map