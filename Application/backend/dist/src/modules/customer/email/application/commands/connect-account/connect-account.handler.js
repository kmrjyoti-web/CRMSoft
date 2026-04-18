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
var ConnectAccountHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectAccountHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const connect_account_command_1 = require("./connect-account.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ConnectAccountHandler = ConnectAccountHandler_1 = class ConnectAccountHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ConnectAccountHandler_1.name);
    }
    async execute(cmd) {
        try {
            const account = await this.prisma.working.emailAccount.create({
                data: {
                    provider: cmd.provider,
                    userId: cmd.userId,
                    emailAddress: cmd.emailAddress,
                    displayName: cmd.displayName,
                    label: cmd.label,
                    accessToken: cmd.accessToken,
                    refreshToken: cmd.refreshToken,
                    tokenExpiresAt: cmd.tokenExpiresAt,
                    imapHost: cmd.imapHost,
                    imapPort: cmd.imapPort,
                    imapSecure: cmd.imapSecure,
                    smtpHost: cmd.smtpHost,
                    smtpPort: cmd.smtpPort,
                    smtpSecure: cmd.smtpSecure,
                    smtpUsername: cmd.smtpUsername,
                    smtpPassword: cmd.smtpPassword,
                    status: 'ACTIVE',
                },
            });
            this.logger.log(`Email account connected: ${account.id} (${cmd.provider}) for user ${cmd.userId}`);
            return account;
        }
        catch (error) {
            this.logger.error(`ConnectAccountHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ConnectAccountHandler = ConnectAccountHandler;
exports.ConnectAccountHandler = ConnectAccountHandler = ConnectAccountHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(connect_account_command_1.ConnectAccountCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConnectAccountHandler);
//# sourceMappingURL=connect-account.handler.js.map