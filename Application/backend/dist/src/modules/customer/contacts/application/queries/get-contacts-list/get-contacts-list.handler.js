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
var GetContactsListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetContactsListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const paginated_list_helper_1 = require("../../../../../../common/utils/paginated-list.helper");
const get_contacts_list_query_1 = require("./get-contacts-list.query");
let GetContactsListHandler = GetContactsListHandler_1 = class GetContactsListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetContactsListHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {};
            if (query.isActive !== undefined)
                where.isActive = query.isActive;
            if (query.designation) {
                where.designation = { contains: query.designation, mode: 'insensitive' };
            }
            if (query.department) {
                where.department = { contains: query.department, mode: 'insensitive' };
            }
            if (query.organizationId) {
                where.contactOrganizations = {
                    some: {
                        organizationId: query.organizationId,
                        isActive: true,
                    },
                };
            }
            if (query.search) {
                where.OR = [
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                    { designation: { contains: query.search, mode: 'insensitive' } },
                    {
                        communications: {
                            some: {
                                value: { contains: query.search, mode: 'insensitive' },
                            },
                        },
                    },
                    {
                        contactOrganizations: {
                            some: {
                                organization: {
                                    name: { contains: query.search, mode: 'insensitive' },
                                },
                            },
                        },
                    },
                ];
            }
            const { page, limit, skip, orderBy } = (0, paginated_list_helper_1.buildPaginationParams)(query);
            const [data, total] = await Promise.all([
                this.prisma.working.contact.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        designation: true,
                        department: true,
                        dataStatus: true,
                        isActive: true,
                        entityVerificationStatus: true,
                        createdAt: true,
                        communications: {
                            select: { id: true, type: true, value: true, isPrimary: true },
                            orderBy: { isPrimary: 'desc' },
                            take: 3,
                        },
                        contactOrganizations: {
                            where: { isActive: true },
                            select: {
                                organization: {
                                    select: { id: true, name: true },
                                },
                            },
                            take: 1,
                        },
                    },
                }),
                this.prisma.working.contact.count({ where }),
            ]);
            return (0, paginated_list_helper_1.buildPaginatedResult)(data, total, page, limit);
        }
        catch (error) {
            this.logger.error(`GetContactsListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetContactsListHandler = GetContactsListHandler;
exports.GetContactsListHandler = GetContactsListHandler = GetContactsListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_contacts_list_query_1.GetContactsListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetContactsListHandler);
//# sourceMappingURL=get-contacts-list.handler.js.map