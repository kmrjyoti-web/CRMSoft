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
var ListQuotationsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListQuotationsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_quotations_query_1 = require("./list-quotations.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ListQuotationsHandler = ListQuotationsHandler_1 = class ListQuotationsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListQuotationsHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (query.status)
                where.status = query.status;
            if (query.leadId)
                where.leadId = query.leadId;
            if (query.userId)
                where.createdById = query.userId;
            if (query.dateFrom || query.dateTo) {
                where.createdAt = {};
                if (query.dateFrom)
                    where.createdAt.gte = query.dateFrom;
                if (query.dateTo)
                    where.createdAt.lte = query.dateTo;
            }
            if (query.search) {
                where.OR = [
                    { quotationNo: { contains: query.search, mode: 'insensitive' } },
                    { title: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.working.quotation.findMany({
                    where, skip, take: limit,
                    orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
                    include: {
                        lineItems: { select: { id: true, productName: true, lineTotal: true } },
                        lead: { select: { id: true, leadNumber: true, contact: { select: { firstName: true, lastName: true } } } },
                    },
                }),
                this.prisma.working.quotation.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`ListQuotationsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListQuotationsHandler = ListQuotationsHandler;
exports.ListQuotationsHandler = ListQuotationsHandler = ListQuotationsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_quotations_query_1.ListQuotationsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListQuotationsHandler);
//# sourceMappingURL=list-quotations.handler.js.map