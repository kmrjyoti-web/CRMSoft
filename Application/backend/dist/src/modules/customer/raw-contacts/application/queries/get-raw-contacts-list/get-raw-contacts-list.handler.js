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
var GetRawContactsListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRawContactsListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const filter_builder_1 = require("../../../../../../common/utils/filter-builder");
const paginated_list_helper_1 = require("../../../../../../common/utils/paginated-list.helper");
const get_raw_contacts_list_query_1 = require("./get-raw-contacts-list.query");
let GetRawContactsListHandler = GetRawContactsListHandler_1 = class GetRawContactsListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetRawContactsListHandler_1.name);
    }
    csvToArray(value) {
        if (!value)
            return undefined;
        return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
    async execute(query) {
        try {
            const statuses = this.csvToArray(query.status);
            const sources = this.csvToArray(query.source);
            const where = new filter_builder_1.PrismaFilterBuilder()
                .exact('isActive', query.isActive)
                .inArray('status', statuses)
                .inArray('source', sources)
                .textContains('companyName', query.companyName)
                .textContains('firstName', query.firstName)
                .textContains('lastName', query.lastName)
                .dateRange('createdAt', query.createdAtFrom, query.createdAtTo)
                .search(query.search, [
                'firstName',
                'lastName',
                'companyName',
                {
                    communications: {
                        some: {
                            value: { contains: query.search, mode: 'insensitive' },
                        },
                    },
                },
            ])
                .build();
            const { page, limit, skip, orderBy } = (0, paginated_list_helper_1.buildPaginationParams)(query);
            const [data, total] = await Promise.all([
                this.prisma.working.rawContact.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        designation: true,
                        department: true,
                        source: true,
                        status: true,
                        isActive: true,
                        entityVerificationStatus: true,
                        createdAt: true,
                        communications: {
                            orderBy: { createdAt: 'asc' },
                            select: {
                                id: true, type: true, value: true, isPrimary: true,
                            },
                        },
                    },
                }),
                this.prisma.working.rawContact.count({ where }),
            ]);
            return (0, paginated_list_helper_1.buildPaginatedResult)(data, total, page, limit);
        }
        catch (error) {
            this.logger.error(`GetRawContactsListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRawContactsListHandler = GetRawContactsListHandler;
exports.GetRawContactsListHandler = GetRawContactsListHandler = GetRawContactsListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_raw_contacts_list_query_1.GetRawContactsListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetRawContactsListHandler);
//# sourceMappingURL=get-raw-contacts-list.handler.js.map