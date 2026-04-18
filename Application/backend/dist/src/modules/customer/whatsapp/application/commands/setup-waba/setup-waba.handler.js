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
var SetupWabaHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupWabaHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const setup_waba_command_1 = require("./setup-waba.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let SetupWabaHandler = SetupWabaHandler_1 = class SetupWabaHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SetupWabaHandler_1.name);
    }
    async execute(cmd) {
        try {
            const waba = await this.prisma.working.whatsAppBusinessAccount.create({
                data: {
                    wabaId: cmd.wabaId,
                    phoneNumberId: cmd.phoneNumberId,
                    phoneNumber: cmd.phoneNumber,
                    displayName: cmd.displayName,
                    accessToken: cmd.accessToken,
                    webhookVerifyToken: cmd.webhookVerifyToken,
                    connectionStatus: 'ACTIVE',
                },
            });
            this.logger.log(`WABA setup complete: ${waba.id} (${cmd.displayName}) phone ${cmd.phoneNumber}`);
            return waba;
        }
        catch (error) {
            this.logger.error(`SetupWabaHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetupWabaHandler = SetupWabaHandler;
exports.SetupWabaHandler = SetupWabaHandler = SetupWabaHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(setup_waba_command_1.SetupWabaCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetupWabaHandler);
//# sourceMappingURL=setup-waba.handler.js.map