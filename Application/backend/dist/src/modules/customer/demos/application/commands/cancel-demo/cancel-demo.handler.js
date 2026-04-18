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
var CancelDemoHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelDemoHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cancel_demo_command_1 = require("./cancel-demo.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CancelDemoHandler = CancelDemoHandler_1 = class CancelDemoHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CancelDemoHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Demo not found');
            const data = {
                status: cmd.isNoShow ? 'NO_SHOW' : 'CANCELLED',
                cancelReason: cmd.reason,
            };
            if (cmd.isNoShow)
                data.noShowReason = cmd.reason;
            const demo = await this.prisma.working.demo.update({
                where: { id: cmd.id },
                data,
                include: { lead: true, conductedBy: true },
            });
            await this.prisma.working.calendarEvent.updateMany({
                where: { eventType: 'DEMO', sourceId: cmd.id },
                data: { isActive: false },
            });
            return demo;
        }
        catch (error) {
            this.logger.error(`CancelDemoHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelDemoHandler = CancelDemoHandler;
exports.CancelDemoHandler = CancelDemoHandler = CancelDemoHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_demo_command_1.CancelDemoCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CancelDemoHandler);
//# sourceMappingURL=cancel-demo.handler.js.map