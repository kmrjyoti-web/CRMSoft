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
var GetTourPlanListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTourPlanListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_tour_plan_list_query_1 = require("./get-tour-plan-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetTourPlanListHandler = GetTourPlanListHandler_1 = class GetTourPlanListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTourPlanListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.status)
                where.status = query.status;
            if (query.salesPersonId)
                where.salesPersonId = query.salesPersonId;
            if (query.search) {
                where.OR = [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            if (query.fromDate || query.toDate) {
                where.planDate = {};
                if (query.fromDate)
                    where.planDate.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.planDate.lte = new Date(query.toDate);
            }
            const [data, total] = await Promise.all([
                this.prisma.working.tourPlan.findMany({
                    where,
                    include: {
                        lead: { select: { id: true, leadNumber: true } },
                        salesPerson: { select: { id: true, firstName: true, lastName: true } },
                        visits: { orderBy: { sortOrder: 'asc' } },
                    },
                    orderBy: { [query.sortBy]: query.sortOrder },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.tourPlan.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetTourPlanListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTourPlanListHandler = GetTourPlanListHandler;
exports.GetTourPlanListHandler = GetTourPlanListHandler = GetTourPlanListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_tour_plan_list_query_1.GetTourPlanListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTourPlanListHandler);
//# sourceMappingURL=get-tour-plan-list.handler.js.map