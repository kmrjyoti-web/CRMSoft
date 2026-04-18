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
var ChangePlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const change_plan_command_1 = require("./change-plan.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let ChangePlanHandler = ChangePlanHandler_1 = class ChangePlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ChangePlanHandler_1.name);
    }
    async execute(command) {
        try {
            const activeSubscription = await this.prisma.identity.subscription.findFirst({
                where: {
                    tenantId: command.tenantId,
                    status: { in: ['ACTIVE', 'TRIALING'] },
                },
            });
            if (!activeSubscription) {
                throw new common_1.NotFoundException(`No active subscription found for tenant ${command.tenantId}`);
            }
            const updated = await this.prisma.identity.subscription.update({
                where: { id: activeSubscription.id },
                data: { planId: command.newPlanId },
            });
            this.logger.log(`Plan changed for tenant ${command.tenantId}: ${activeSubscription.planId} -> ${command.newPlanId}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`ChangePlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChangePlanHandler = ChangePlanHandler;
exports.ChangePlanHandler = ChangePlanHandler = ChangePlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(change_plan_command_1.ChangePlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChangePlanHandler);
//# sourceMappingURL=change-plan.handler.js.map