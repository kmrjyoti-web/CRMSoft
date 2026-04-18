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
var SmsAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsAdapter = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../../common/utils/error.utils");
let SmsAdapter = SmsAdapter_1 = class SmsAdapter {
    constructor(prisma) {
        this.prisma = prisma;
        this.channel = 'SMS';
        this.logger = new common_1.Logger(SmsAdapter_1.name);
    }
    async send(params) {
        try {
            this.logger.log(`[SMS] Sending to ${params.recipientAddr || params.recipientId}: ${params.body?.substring(0, 100)}`);
            await this.prisma.communicationLog.create({
                data: {
                    channel: 'SMS',
                    recipientId: params.recipientId,
                    recipientAddr: params.recipientAddr,
                    body: params.body,
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });
            return { success: true, messageId: `sms-${Date.now()}` };
        }
        catch (error) {
            this.logger.error(`SMS send failed: ${(0, error_utils_1.getErrorMessage)(error)}`);
            return { success: false, error: (0, error_utils_1.getErrorMessage)(error) };
        }
    }
};
exports.SmsAdapter = SmsAdapter;
exports.SmsAdapter = SmsAdapter = SmsAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmsAdapter);
//# sourceMappingURL=sms.adapter.js.map