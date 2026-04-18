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
var GetLeadsListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLeadsListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const paginated_list_helper_1 = require("../../../../../../common/utils/paginated-list.helper");
const get_leads_list_query_1 = require("./get-leads-list.query");
let GetLeadsListHandler = GetLeadsListHandler_1 = class GetLeadsListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetLeadsListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.isActive !== undefined)
                where.isActive = query.isActive;
            if (query.status) {
                const vals = query.status.split(',').map((v) => v.trim()).filter(Boolean);
                where.status = vals.length === 1 ? vals[0] : { in: vals };
            }
            if (query.priority) {
                const vals = query.priority.split(',').map((v) => v.trim()).filter(Boolean);
                where.priority = vals.length === 1 ? vals[0] : { in: vals };
            }
            if (query.allocatedToId)
                where.allocatedToId = query.allocatedToId;
            if (query.contactId)
                where.contactId = query.contactId;
            if (query.organizationId)
                where.organizationId = query.organizationId;
            if (query.search) {
                where.OR = [
                    { leadNumber: { contains: query.search, mode: 'insensitive' } },
                    { notes: { contains: query.search, mode: 'insensitive' } },
                    {
                        contact: {
                            OR: [
                                { firstName: { contains: query.search, mode: 'insensitive' } },
                                { lastName: { contains: query.search, mode: 'insensitive' } },
                            ],
                        },
                    },
                    {
                        organization: {
                            name: { contains: query.search, mode: 'insensitive' },
                        },
                    },
                ];
            }
            const { page, limit, skip, orderBy } = (0, paginated_list_helper_1.buildPaginationParams)(query);
            const [data, total] = await Promise.all([
                this.prisma.working.lead.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    select: {
                        id: true,
                        leadNumber: true,
                        status: true,
                        priority: true,
                        expectedValue: true,
                        isActive: true,
                        createdAt: true,
                        contact: {
                            select: {
                                id: true, firstName: true, lastName: true,
                                communications: {
                                    where: { isPrimary: true },
                                    select: { type: true, value: true },
                                    take: 2,
                                },
                            },
                        },
                        organization: {
                            select: { id: true, name: true },
                        },
                        allocatedToId: true,
                    },
                }),
                this.prisma.working.lead.count({ where }),
            ]);
            return (0, paginated_list_helper_1.buildPaginatedResult)(data, total, page, limit);
        }
        catch (error) {
            this.logger.error(`GetLeadsListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetLeadsListHandler = GetLeadsListHandler;
exports.GetLeadsListHandler = GetLeadsListHandler = GetLeadsListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_leads_list_query_1.GetLeadsListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetLeadsListHandler);
//# sourceMappingURL=get-leads-list.handler.js.map