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
var CancelScheduledEmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelScheduledEmailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cancel_scheduled_email_command_1 = require("./cancel-scheduled-email.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CancelScheduledEmailHandler = CancelScheduledEmailHandler_1 = class CancelScheduledEmailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CancelScheduledEmailHandler_1.name);
    }
    async execute(cmd) {
        try {
            const email = await this.prisma.working.email.update({
                where: { id: cmd.emailId },
                data: {
                    status: 'DRAFT',
                    scheduledAt: null,
                },
            });
            this.logger.log(`Scheduled email cancelled: ${cmd.emailId} by user ${cmd.userId}`);
            return email;
        }
        catch (error) {
            this.logger.error(`CancelScheduledEmailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelScheduledEmailHandler = CancelScheduledEmailHandler;
exports.CancelScheduledEmailHandler = CancelScheduledEmailHandler = CancelScheduledEmailHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_scheduled_email_command_1.CancelScheduledEmailCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CancelScheduledEmailHandler);
//# sourceMappingURL=cancel-scheduled-email.handler.js.map