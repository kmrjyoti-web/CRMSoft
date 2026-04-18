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
var DisconnectAccountHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisconnectAccountHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const disconnect_account_command_1 = require("./disconnect-account.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let DisconnectAccountHandler = DisconnectAccountHandler_1 = class DisconnectAccountHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DisconnectAccountHandler_1.name);
    }
    async execute(cmd) {
        try {
            const account = await this.prisma.working.emailAccount.update({
                where: { id: cmd.accountId },
                data: {
                    status: 'DISCONNECTED',
                    accessToken: null,
                    refreshToken: null,
                    tokenExpiresAt: null,
                    syncEnabled: false,
                },
            });
            this.logger.log(`Email account disconnected: ${cmd.accountId} by user ${cmd.userId}`);
            return account;
        }
        catch (error) {
            this.logger.error(`DisconnectAccountHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DisconnectAccountHandler = DisconnectAccountHandler;
exports.DisconnectAccountHandler = DisconnectAccountHandler = DisconnectAccountHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(disconnect_account_command_1.DisconnectAccountCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisconnectAccountHandler);
//# sourceMappingURL=disconnect-account.handler.js.map