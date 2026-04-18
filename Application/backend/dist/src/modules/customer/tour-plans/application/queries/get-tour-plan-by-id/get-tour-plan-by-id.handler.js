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
var GetTourPlanByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTourPlanByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_tour_plan_by_id_query_1 = require("./get-tour-plan-by-id.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetTourPlanByIdHandler = GetTourPlanByIdHandler_1 = class GetTourPlanByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTourPlanByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const tourPlan = await this.prisma.working.tourPlan.findUnique({
                where: { id: query.id },
                include: {
                    lead: { select: { id: true, leadNumber: true, status: true } },
                    salesPerson: { select: { id: true, firstName: true, lastName: true, email: true } },
                    visits: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            lead: { select: { id: true, leadNumber: true } },
                            contact: { select: { id: true, firstName: true, lastName: true } },
                            photos: true,
                        },
                    },
                },
            });
            if (!tourPlan)
                throw new common_1.NotFoundException('Tour plan not found');
            return tourPlan;
        }
        catch (error) {
            this.logger.error(`GetTourPlanByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTourPlanByIdHandler = GetTourPlanByIdHandler;
exports.GetTourPlanByIdHandler = GetTourPlanByIdHandler = GetTourPlanByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_tour_plan_by_id_query_1.GetTourPlanByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTourPlanByIdHandler);
//# sourceMappingURL=get-tour-plan-by-id.handler.js.map