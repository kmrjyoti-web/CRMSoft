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
var GetActivityListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_activity_list_query_1 = require("./get-activity-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const paginated_list_helper_1 = require("../../../../../../common/utils/paginated-list.helper");
let GetActivityListHandler = GetActivityListHandler_1 = class GetActivityListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetActivityListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.isActive !== undefined)
                where.isActive = query.isActive;
            if (query.type)
                where.type = query.type;
            if (query.leadId)
                where.leadId = query.leadId;
            if (query.contactId)
                where.contactId = query.contactId;
            if (query.createdById)
                where.createdById = query.createdById;
            if (query.search) {
                where.OR = [
                    { subject: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            if (query.fromDate || query.toDate) {
                where.scheduledAt = {};
                if (query.fromDate)
                    where.scheduledAt.gte = new Date(query.fromDate);
                if (query.toDate)
                    where.scheduledAt.lte = new Date(query.toDate);
            }
            const { page, limit, skip, orderBy } = (0, paginated_list_helper_1.buildPaginationParams)(query);
            const [data, total] = await Promise.all([
                this.prisma.working.activity.findMany({
                    where,
                    include: { lead: { select: { id: true, leadNumber: true } }, contact: { select: { id: true, firstName: true, lastName: true } }, createdByUser: { select: { id: true, firstName: true, lastName: true } } },
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.prisma.working.activity.count({ where }),
            ]);
            return (0, paginated_list_helper_1.buildPaginatedResult)(data, total, page, limit);
        }
        catch (error) {
            this.logger.error(`GetActivityListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetActivityListHandler = GetActivityListHandler;
exports.GetActivityListHandler = GetActivityListHandler = GetActivityListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_activity_list_query_1.GetActivityListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetActivityListHandler);
//# sourceMappingURL=get-activity-list.handler.js.map