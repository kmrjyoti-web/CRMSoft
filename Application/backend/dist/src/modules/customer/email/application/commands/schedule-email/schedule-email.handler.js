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
var ScheduleEmailHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleEmailHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const schedule_email_command_1 = require("./schedule-email.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ScheduleEmailHandler = ScheduleEmailHandler_1 = class ScheduleEmailHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ScheduleEmailHandler_1.name);
    }
    async execute(cmd) {
        try {
            const email = await this.prisma.working.email.update({
                where: { id: cmd.emailId },
                data: {
                    status: 'QUEUED',
                    scheduledAt: cmd.scheduledAt,
                },
            });
            this.logger.log(`Email scheduled: ${cmd.emailId} for ${cmd.scheduledAt.toISOString()}`);
            return email;
        }
        catch (error) {
            this.logger.error(`ScheduleEmailHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ScheduleEmailHandler = ScheduleEmailHandler;
exports.ScheduleEmailHandler = ScheduleEmailHandler = ScheduleEmailHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(schedule_email_command_1.ScheduleEmailCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleEmailHandler);
//# sourceMappingURL=schedule-email.handler.js.map