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
var DeactivatePlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeactivatePlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const deactivate_plan_command_1 = require("./deactivate-plan.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let DeactivatePlanHandler = DeactivatePlanHandler_1 = class DeactivatePlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeactivatePlanHandler_1.name);
    }
    async execute(command) {
        try {
            const plan = await this.prisma.identity.plan.update({
                where: { id: command.planId },
                data: { isActive: false },
            });
            this.logger.log(`Plan deactivated: ${plan.id}`);
            return plan;
        }
        catch (error) {
            this.logger.error(`DeactivatePlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeactivatePlanHandler = DeactivatePlanHandler;
exports.DeactivatePlanHandler = DeactivatePlanHandler = DeactivatePlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(deactivate_plan_command_1.DeactivatePlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeactivatePlanHandler);
//# sourceMappingURL=deactivate-plan.handler.js.map