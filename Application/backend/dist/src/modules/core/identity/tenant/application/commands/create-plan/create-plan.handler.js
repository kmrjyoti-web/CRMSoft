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
var CreatePlanHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlanHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_plan_command_1 = require("./create-plan.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let CreatePlanHandler = CreatePlanHandler_1 = class CreatePlanHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreatePlanHandler_1.name);
    }
    async execute(command) {
        try {
            const plan = await this.prisma.identity.plan.create({
                data: {
                    name: command.name,
                    code: command.code,
                    description: command.description,
                    interval: command.interval,
                    price: command.price,
                    currency: command.currency ?? 'INR',
                    maxUsers: command.maxUsers,
                    maxContacts: command.maxContacts,
                    maxLeads: command.maxLeads,
                    maxProducts: command.maxProducts,
                    maxStorage: command.maxStorage,
                    features: command.features,
                    isActive: command.isActive ?? true,
                    sortOrder: command.sortOrder ?? 0,
                },
            });
            this.logger.log(`Plan created: ${plan.id} (${plan.name})`);
            return plan;
        }
        catch (error) {
            this.logger.error(`CreatePlanHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreatePlanHandler = CreatePlanHandler;
exports.CreatePlanHandler = CreatePlanHandler = CreatePlanHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_plan_command_1.CreatePlanCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatePlanHandler);
//# sourceMappingURL=create-plan.handler.js.map