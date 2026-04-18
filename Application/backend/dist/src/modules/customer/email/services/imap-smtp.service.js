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
exports.ImapSmtpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ImapSmtpService = class ImapSmtpService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendEmail(accountId, params) {
        const account = await this.prisma.working.emailAccount.findUniqueOrThrow({ where: { id: accountId } });
        if (!account.smtpHost || !account.smtpPort) {
            throw new common_1.BadRequestException('SMTP configuration is incomplete');
        }
        return {
            messageId: `smtp-${Date.now()}@${account.smtpHost}`,
        };
    }
    async fetchEmails(accountId, options) {
        const account = await this.prisma.working.emailAccount.findUniqueOrThrow({ where: { id: accountId } });
        if (!account.imapHost || !account.imapPort) {
            throw new common_1.BadRequestException('IMAP configuration is incomplete');
        }
        return { emails: [] };
    }
    async testConnection(config) {
        return { smtp: true, imap: !!config.imapHost };
    }
};
exports.ImapSmtpService = ImapSmtpService;
exports.ImapSmtpService = ImapSmtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImapSmtpService);
//# sourceMappingURL=imap-smtp.service.js.map