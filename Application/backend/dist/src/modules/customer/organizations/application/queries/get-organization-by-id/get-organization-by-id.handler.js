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
var GetOrganizationByIdHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_organization_by_id_query_1 = require("./get-organization-by-id.query");
let GetOrganizationByIdHandler = GetOrganizationByIdHandler_1 = class GetOrganizationByIdHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetOrganizationByIdHandler_1.name);
    }
    async execute(query) {
        try {
            const org = await this.prisma.working.organization.findUnique({
                where: { id: query.organizationId },
                include: {
                    contacts: {
                        select: {
                            id: true, relationType: true, designation: true, isPrimary: true,
                            contact: {
                                select: { id: true, firstName: true, lastName: true },
                            },
                        },
                        take: 50,
                    },
                    leads: {
                        select: {
                            id: true, leadNumber: true, status: true,
                            priority: true, expectedValue: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                    },
                    filters: {
                        include: {
                            lookupValue: {
                                select: {
                                    id: true, value: true, label: true,
                                    lookup: { select: { category: true } },
                                },
                            },
                        },
                    },
                    _count: { select: { contacts: true, leads: true } },
                },
            });
            if (!org)
                throw new common_1.NotFoundException(`Organization ${query.organizationId} not found`);
            return org;
        }
        catch (error) {
            this.logger.error(`GetOrganizationByIdHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetOrganizationByIdHandler = GetOrganizationByIdHandler;
exports.GetOrganizationByIdHandler = GetOrganizationByIdHandler = GetOrganizationByIdHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_organization_by_id_query_1.GetOrganizationByIdQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetOrganizationByIdHandler);
//# sourceMappingURL=get-organization-by-id.handler.js.map