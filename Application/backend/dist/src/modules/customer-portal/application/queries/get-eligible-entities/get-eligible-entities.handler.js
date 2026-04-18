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
var GetEligibleEntitiesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEligibleEntitiesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_eligible_entities_query_1 = require("./get-eligible-entities.query");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const paginated_type_1 = require("../../../../../common/types/paginated.type");
let GetEligibleEntitiesHandler = GetEligibleEntitiesHandler_1 = class GetEligibleEntitiesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetEligibleEntitiesHandler_1.name);
    }
    async execute(query) {
        try {
            const { tenantId, entityType, search, page, limit } = query;
            const skip = (page - 1) * limit;
            const activatedUsers = await this.prisma.identity.customerUser.findMany({
                where: { tenantId, isDeleted: false },
                select: { linkedEntityType: true, linkedEntityId: true },
            });
            const activatedSet = new Set(activatedUsers.map((u) => `${u.linkedEntityType}:${u.linkedEntityId}`));
            const workingClient = await this.prisma.getWorkingClient(tenantId);
            const results = [];
            if (!entityType || entityType === 'CONTACT') {
                const where = {
                    tenantId,
                    isDeleted: false,
                    entityVerificationStatus: 'VERIFIED',
                    ...(search
                        ? {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' } },
                                { lastName: { contains: search, mode: 'insensitive' } },
                            ],
                        }
                        : {}),
                };
                const contacts = await workingClient.contact.findMany({
                    where,
                    take: limit,
                    skip,
                    include: {
                        communications: { where: { type: 'EMAIL' }, take: 1, orderBy: { createdAt: 'desc' } },
                    },
                    orderBy: { firstName: 'asc' },
                });
                for (const c of contacts) {
                    results.push({
                        id: c.id,
                        entityType: 'CONTACT',
                        name: `${c.firstName} ${c.lastName}`.trim(),
                        email: c.communications?.[0]?.value ?? null,
                        phone: null,
                        isAlreadyActivated: activatedSet.has(`CONTACT:${c.id}`),
                    });
                }
            }
            if (!entityType || entityType === 'ORGANIZATION') {
                const where = {
                    tenantId,
                    isDeleted: false,
                    entityVerificationStatus: 'VERIFIED',
                    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                };
                const orgs = await workingClient.organization.findMany({
                    where,
                    take: limit,
                    skip,
                    orderBy: { name: 'asc' },
                });
                for (const o of orgs) {
                    results.push({
                        id: o.id,
                        entityType: 'ORGANIZATION',
                        name: o.name,
                        email: o.email ?? null,
                        phone: o.phone ?? null,
                        isAlreadyActivated: activatedSet.has(`ORGANIZATION:${o.id}`),
                    });
                }
            }
            if (!entityType || entityType === 'LEDGER') {
                const where = {
                    tenantId,
                    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
                };
                const ledgers = await workingClient.ledgerMaster.findMany({
                    where,
                    take: limit,
                    skip,
                    orderBy: { name: 'asc' },
                });
                for (const l of ledgers) {
                    results.push({
                        id: l.id,
                        entityType: 'LEDGER',
                        name: l.name,
                        email: l.email ?? null,
                        phone: null,
                        isAlreadyActivated: activatedSet.has(`LEDGER:${l.id}`),
                    });
                }
            }
            return (0, paginated_type_1.paginate)(results, results.length, page, limit);
        }
        catch (error) {
            this.logger.error(`GetEligibleEntitiesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetEligibleEntitiesHandler = GetEligibleEntitiesHandler;
exports.GetEligibleEntitiesHandler = GetEligibleEntitiesHandler = GetEligibleEntitiesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_eligible_entities_query_1.GetEligibleEntitiesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetEligibleEntitiesHandler);
//# sourceMappingURL=get-eligible-entities.handler.js.map