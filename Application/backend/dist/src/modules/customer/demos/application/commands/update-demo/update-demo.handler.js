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
var UpdateDemoHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDemoHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_demo_command_1 = require("./update-demo.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateDemoHandler = UpdateDemoHandler_1 = class UpdateDemoHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateDemoHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.demo.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Demo not found');
            const demo = await this.prisma.working.demo.update({
                where: { id: cmd.id },
                data: cmd.data,
                include: { lead: true, conductedBy: true },
            });
            if (cmd.data.scheduledAt) {
                await this.prisma.working.calendarEvent.updateMany({
                    where: { eventType: 'DEMO', sourceId: cmd.id },
                    data: { startTime: cmd.data.scheduledAt },
                });
            }
            return demo;
        }
        catch (error) {
            this.logger.error(`UpdateDemoHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateDemoHandler = UpdateDemoHandler;
exports.UpdateDemoHandler = UpdateDemoHandler = UpdateDemoHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_demo_command_1.UpdateDemoCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateDemoHandler);
//# sourceMappingURL=update-demo.handler.js.map