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
var UpdateTourPlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTourPlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_tour_plan_command_1 = require("./update-tour-plan.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateTourPlanHandler = UpdateTourPlanHandler_1 = class UpdateTourPlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTourPlanHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Tour plan not found');
            if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
                throw new common_1.BadRequestException('Can only edit tour plans in DRAFT or REJECTED status');
            }
            const tourPlan = await this.prisma.working.tourPlan.update({
                where: { id: cmd.id },
                data: cmd.data,
                include: { lead: true, salesPerson: true, visits: true },
            });
            if (cmd.data.planDate) {
                await this.prisma.working.calendarEvent.updateMany({
                    where: { eventType: 'TOUR_PLAN', sourceId: cmd.id },
                    data: { startTime: cmd.data.planDate, title: cmd.data.title || existing.title },
                });
            }
            return tourPlan;
        }
        catch (error) {
            this.logger.error(`UpdateTourPlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTourPlanHandler = UpdateTourPlanHandler;
exports.UpdateTourPlanHandler = UpdateTourPlanHandler = UpdateTourPlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_tour_plan_command_1.UpdateTourPlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateTourPlanHandler);
//# sourceMappingURL=update-tour-plan.handler.js.map