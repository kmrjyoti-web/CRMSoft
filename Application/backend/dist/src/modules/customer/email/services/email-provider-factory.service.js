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
exports.EmailProviderFactoryService = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const gmail_service_1 = require("./gmail.service");
const outlook_service_1 = require("./outlook.service");
const imap_smtp_service_1 = require("./imap-smtp.service");
let EmailProviderFactoryService = class EmailProviderFactoryService {
    constructor(gmailService, outlookService, imapSmtpService) {
        this.gmailService = gmailService;
        this.outlookService = outlookService;
        this.imapSmtpService = imapSmtpService;
    }
    getService(provider) {
        switch (provider) {
            case working_client_1.EmailProvider.GMAIL:
                return this.gmailService;
            case working_client_1.EmailProvider.OUTLOOK:
                return this.outlookService;
            case working_client_1.EmailProvider.IMAP_SMTP:
            case working_client_1.EmailProvider.ORGANIZATION_SMTP:
                return this.imapSmtpService;
            default:
                throw new common_1.BadRequestException(`Unsupported email provider: ${provider}`);
        }
    }
};
exports.EmailProviderFactoryService = EmailProviderFactoryService;
exports.EmailProviderFactoryService = EmailProviderFactoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gmail_service_1.GmailService,
        outlook_service_1.OutlookService,
        imap_smtp_service_1.ImapSmtpService])
], EmailProviderFactoryService);
//# sourceMappingURL=email-provider-factory.service.js.map