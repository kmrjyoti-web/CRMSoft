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
var PushAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushAdapter = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../../common/utils/error.utils");
let PushAdapter = PushAdapter_1 = class PushAdapter {
    constructor(prisma) {
        this.prisma = prisma;
        this.channel = 'PUSH';
        this.logger = new common_1.Logger(PushAdapter_1.name);
    }
    async send(params) {
        try {
            this.logger.log(`[PUSH] Sending to ${params.recipientId}: ${params.subject}`);
            await this.prisma.communicationLog.create({
                data: {
                    channel: 'PUSH',
                    recipientId: params.recipientId,
                    subject: params.subject,
                    body: params.body,
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });
            return { success: true, messageId: `push-${Date.now()}` };
        }
        catch (error) {
            this.logger.error(`Push send failed: ${(0, error_utils_1.getErrorMessage)(error)}`);
            return { success: false, error: (0, error_utils_1.getErrorMessage)(error) };
        }
    }
};
exports.PushAdapter = PushAdapter;
exports.PushAdapter = PushAdapter = PushAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PushAdapter);
//# sourceMappingURL=push.adapter.js.map