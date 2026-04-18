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
var UpdatePlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_plan_command_1 = require("./update-plan.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let UpdatePlanHandler = UpdatePlanHandler_1 = class UpdatePlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdatePlanHandler_1.name);
    }
    async execute(command) {
        try {
            const plan = await this.prisma.identity.plan.update({
                where: { id: command.planId },
                data: {
                    ...(command.name !== undefined && { name: command.name }),
                    ...(command.description !== undefined && { description: command.description }),
                    ...(command.price !== undefined && { price: command.price }),
                    ...(command.maxUsers !== undefined && { maxUsers: command.maxUsers }),
                    ...(command.maxContacts !== undefined && { maxContacts: command.maxContacts }),
                    ...(command.maxLeads !== undefined && { maxLeads: command.maxLeads }),
                    ...(command.maxProducts !== undefined && { maxProducts: command.maxProducts }),
                    ...(command.maxStorage !== undefined && { maxStorage: command.maxStorage }),
                    ...(command.features !== undefined && { features: command.features }),
                    ...(command.isActive !== undefined && { isActive: command.isActive }),
                    ...(command.sortOrder !== undefined && { sortOrder: command.sortOrder }),
                },
            });
            this.logger.log(`Plan updated: ${plan.id}`);
            return plan;
        }
        catch (error) {
            this.logger.error(`UpdatePlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdatePlanHandler = UpdatePlanHandler;
exports.UpdatePlanHandler = UpdatePlanHandler = UpdatePlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_plan_command_1.UpdatePlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdatePlanHandler);
//# sourceMappingURL=update-plan.handler.js.map