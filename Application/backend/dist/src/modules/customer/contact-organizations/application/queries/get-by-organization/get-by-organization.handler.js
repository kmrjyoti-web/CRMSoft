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
var GetContactsByOrgHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetContactsByOrgHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_by_organization_query_1 = require("./get-by-organization.query");
let GetContactsByOrgHandler = GetContactsByOrgHandler_1 = class GetContactsByOrgHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetContactsByOrgHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { organizationId: query.organizationId };
            if (query.activeOnly !== false)
                where.isActive = true;
            return this.prisma.working.contactOrganization.findMany({
                where,
                orderBy: [{ isPrimary: 'desc' }, { relationType: 'asc' }, { createdAt: 'asc' }],
                include: {
                    contact: {
                        select: {
                            id: true, firstName: true, lastName: true,
                            designation: true, isActive: true,
                            communications: {
                                where: { isPrimary: true },
                                select: { type: true, value: true },
                                take: 3,
                            },
                        },
                    },
                },
            });
        }
        catch (error) {
            this.logger.error(`GetContactsByOrgHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetContactsByOrgHandler = GetContactsByOrgHandler;
exports.GetContactsByOrgHandler = GetContactsByOrgHandler = GetContactsByOrgHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_by_organization_query_1.GetContactsByOrgQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetContactsByOrgHandler);
//# sourceMappingURL=get-by-organization.handler.js.map