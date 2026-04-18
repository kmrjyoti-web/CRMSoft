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
var GetDemoListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDemoListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_demo_list_query_1 = require("./get-demo-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetDemoListHandler = GetDemoListHandler_1 = class GetDemoListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetDemoListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.status)
                where.status = query.status;
            if (query.mode)
                where.mode = query.mode;
            if (query.conductedById)
                where.conductedById = query.conductedById;
            if (query.search) {
                where.OR = [
                    { notes: { contains: query.search, mode: 'insensitive' } },
                    { lead: { leadNumber: { contains: query.search, mode: 'insensitive' } } },
                ];
            }
            if (query.fromDate || query.toDate) {
                where.scheduledAt = {};
                if (query.fromDate)
                    where.scheduledAt.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.scheduledAt.lte = new Date(query.toDate);
            }
            const [data, total] = await Promise.all([
                this.prisma.working.demo.findMany({
                    where,
                    include: {
                        lead: { select: { id: true, leadNumber: true } },
                        conductedBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                    orderBy: { [query.sortBy]: query.sortOrder },
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                }),
                this.prisma.working.demo.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetDemoListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetDemoListHandler = GetDemoListHandler;
exports.GetDemoListHandler = GetDemoListHandler = GetDemoListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_demo_list_query_1.GetDemoListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetDemoListHandler);
//# sourceMappingURL=get-demo-list.handler.js.map