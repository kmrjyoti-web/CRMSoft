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
var ApproveTourPlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveTourPlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const approve_tour_plan_command_1 = require("./approve-tour-plan.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ApproveTourPlanHandler = ApproveTourPlanHandler_1 = class ApproveTourPlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ApproveTourPlanHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Tour plan not found');
            if (existing.status !== 'PENDING_APPROVAL') {
                throw new common_1.BadRequestException('Tour plan is not pending approval');
            }
            return this.prisma.working.tourPlan.update({
                where: { id: cmd.id },
                data: {
                    status: 'APPROVED',
                    approvedById: cmd.userId,
                    approvedAt: new Date(),
                },
                include: { lead: true, salesPerson: true },
            });
        }
        catch (error) {
            this.logger.error(`ApproveTourPlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ApproveTourPlanHandler = ApproveTourPlanHandler;
exports.ApproveTourPlanHandler = ApproveTourPlanHandler = ApproveTourPlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(approve_tour_plan_command_1.ApproveTourPlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApproveTourPlanHandler);
//# sourceMappingURL=approve-tour-plan.handler.js.map