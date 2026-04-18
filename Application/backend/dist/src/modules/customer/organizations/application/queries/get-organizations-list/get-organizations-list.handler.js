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
var GetOrganizationsListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationsListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const paginated_list_helper_1 = require("../../../../../../common/utils/paginated-list.helper");
const get_organizations_list_query_1 = require("./get-organizations-list.query");
let GetOrganizationsListHandler = GetOrganizationsListHandler_1 = class GetOrganizationsListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetOrganizationsListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.isActive !== undefined)
                where.isActive = query.isActive;
            if (query.city)
                where.city = { contains: query.city, mode: 'insensitive' };
            if (query.industry)
                where.industry = { contains: query.industry, mode: 'insensitive' };
            if (query.search) {
                where.OR = [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { gstNumber: { contains: query.search, mode: 'insensitive' } },
                    { city: { contains: query.search, mode: 'insensitive' } },
                    { website: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const { page, limit, skip, orderBy } = (0, paginated_list_helper_1.buildPaginationParams)(query);
            const [data, total] = await Promise.all([
                this.prisma.working.organization.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        industry: true,
                        gstNumber: true,
                        website: true,
                        isActive: true,
                        entityVerificationStatus: true,
                        createdAt: true,
                        communications: {
                            select: { id: true, type: true, value: true, isPrimary: true },
                            orderBy: { isPrimary: 'desc' },
                            take: 3,
                        },
                    },
                }),
                this.prisma.working.organization.count({ where }),
            ]);
            return (0, paginated_list_helper_1.buildPaginatedResult)(data, total, page, limit);
        }
        catch (error) {
            this.logger.error(`GetOrganizationsListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetOrganizationsListHandler = GetOrganizationsListHandler;
exports.GetOrganizationsListHandler = GetOrganizationsListHandler = GetOrganizationsListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_organizations_list_query_1.GetOrganizationsListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetOrganizationsListHandler);
//# sourceMappingURL=get-organizations-list.handler.js.map