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
var GetPlanByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPlanByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const query_1 = require("./query");
let GetPlanByIdHandler = GetPlanByIdHandler_1 = class GetPlanByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetPlanByIdHandler_1.name);
    }
    async execute(query) {
        this.logger.log(`Fetching plan by id: ${query.planId}`);
        const plan = await this.prisma.identity.plan.findUnique({
            where: { id: query.planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan ${query.planId} not found`);
        }
        return plan;
    }
};
exports.GetPlanByIdHandler = GetPlanByIdHandler;
exports.GetPlanByIdHandler = GetPlanByIdHandler = GetPlanByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(query_1.GetPlanByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetPlanByIdHandler);
//# sourceMappingURL=handler.js.map