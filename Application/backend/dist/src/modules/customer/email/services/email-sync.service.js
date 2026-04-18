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
exports.EmailSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const email_provider_factory_service_1 = require("./email-provider-factory.service");
const thread_builder_service_1 = require("./thread-builder.service");
const email_linker_service_1 = require("./email-linker.service");
const working_client_1 = require("@prisma/working-client");
let EmailSyncService = class EmailSyncService {
    constructor(prisma, providerFactory, threadBuilder, linker) {
        this.prisma = prisma;
        this.providerFactory = providerFactory;
        this.threadBuilder = threadBuilder;
        this.linker = linker;
    }
    async syncAccount(accountId) {
        const account = await this.prisma.working.emailAccount.findUniqueOrThrow({
            where: { id: accountId },
        });
        if (account.status !== working_client_1.EmailAccountStatus.ACTIVE) {
            return { newEmails: 0, errors: 0 };
        }
        await this.prisma.working.emailAccount.update({
            where: { id: accountId },
            data: { status: 'SYNCING' },
        });
        let newEmails = 0;
        let errors = 0;
        try {
            const provider = this.providerFactory.getService(account.provider);
            const result = await provider.fetchEmails(accountId, {
                syncToken: account.syncToken || undefined,
                since: account.syncFromDate || undefined,
            });
            for (const fetched of result.emails) {
                try {
                    if (fetched.internetMessageId) {
                        const existing = await this.prisma.working.email.findFirst({
                            where: { internetMessageId: fetched.internetMessageId },
                        });
                        if (existing)
                            continue;
                    }
                    const email = await this.prisma.working.email.create({
                        data: {
                            accountId,
                            direction: 'INBOUND',
                            fromEmail: fetched.from.email,
                            fromName: fetched.from.name,
                            toEmails: fetched.to,
                            ccEmails: fetched.cc || [],
                            subject: fetched.subject,
                            bodyHtml: fetched.bodyHtml,
                            bodyText: fetched.bodyText,
                            snippet: fetched.snippet || fetched.bodyText?.slice(0, 200),
                            providerMessageId: fetched.providerMessageId,
                            providerThreadId: fetched.providerThreadId,
                            internetMessageId: fetched.internetMessageId,
                            inReplyToMessageId: fetched.inReplyTo,
                            references: fetched.references || [],
                            status: 'DELIVERED',
                            sentAt: fetched.date,
                            isRead: fetched.isRead || false,
                            labels: fetched.labels || [],
                            hasAttachments: (fetched.attachments?.length || 0) > 0,
                            attachmentCount: fetched.attachments?.length || 0,
                        },
                    });
                    if (fetched.attachments?.length) {
                        await this.prisma.working.emailAttachment.createMany({
                            data: fetched.attachments.map(a => ({
                                emailId: email.id,
                                fileName: a.fileName,
                                mimeType: a.mimeType,
                                fileSize: a.size,
                                providerAttachmentId: a.attachmentId,
                            })),
                        });
                    }
                    await this.threadBuilder.assignThread(email.id);
                    if (account.autoLinkEnabled) {
                        const participants = [fetched.from.email, ...fetched.to.map(t => t.email)];
                        await this.linker.autoLink(email.id, participants);
                    }
                    newEmails++;
                }
                catch {
                    errors++;
                }
            }
            await this.prisma.working.emailAccount.update({
                where: { id: accountId },
                data: {
                    status: 'ACTIVE',
                    lastSyncAt: new Date(),
                    lastSyncError: null,
                    syncToken: result.newSyncToken || account.syncToken,
                    totalReceived: { increment: newEmails },
                },
            });
        }
        catch (error) {
            await this.prisma.working.emailAccount.update({
                where: { id: accountId },
                data: {
                    status: 'ERROR',
                    lastSyncError: error.message,
                },
            });
            throw error;
        }
        return { newEmails, errors };
    }
    async syncAllAccounts() {
        const accounts = await this.prisma.working.emailAccount.findMany({
            where: { syncEnabled: true, status: 'ACTIVE' },
        });
        let synced = 0;
        let failed = 0;
        for (const account of accounts) {
            try {
                await this.syncAccount(account.id);
                synced++;
            }
            catch {
                failed++;
            }
        }
        return { synced, failed };
    }
};
exports.EmailSyncService = EmailSyncService;
exports.EmailSyncService = EmailSyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_provider_factory_service_1.EmailProviderFactoryService,
        thread_builder_service_1.ThreadBuilderService,
        email_linker_service_1.EmailLinkerService])
], EmailSyncService);
//# sourceMappingURL=email-sync.service.js.map