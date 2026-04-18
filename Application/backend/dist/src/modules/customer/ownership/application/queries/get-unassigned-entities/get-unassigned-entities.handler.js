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
var GetUnassignedEntitiesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUnassignedEntitiesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_unassigned_entities_query_1 = require("./get-unassigned-entities.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetUnassignedEntitiesHandler = GetUnassignedEntitiesHandler_1 = class GetUnassignedEntitiesHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetUnassignedEntitiesHandler_1.name);
    }
    async execute(query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 20;
            const ownedIds = await this.prisma.working.entityOwner.findMany({
                where: { entityType: query.entityType, ownerType: 'PRIMARY_OWNER', isActive: true },
                select: { entityId: true },
            });
            const ownedSet = new Set(ownedIds.map((o) => o.entityId));
            let entities = [];
            let total = 0;
            switch (query.entityType) {
                case 'LEAD': {
                    const all = await this.prisma.working.lead.findMany({
                        select: { id: true, leadNumber: true, status: true, createdAt: true },
                        orderBy: { createdAt: 'asc' },
                    });
                    const unassigned = all.filter((e) => !ownedSet.has(e.id));
                    total = unassigned.length;
                    entities = unassigned.slice((page - 1) * limit, page * limit);
                    break;
                }
                case 'CONTACT': {
                    const all = await this.prisma.working.contact.findMany({
                        where: { isActive: true }, select: { id: true, firstName: true, lastName: true, createdAt: true },
                        orderBy: { createdAt: 'asc' },
                    });
                    const unassigned = all.filter((e) => !ownedSet.has(e.id));
                    total = unassigned.length;
                    entities = unassigned.slice((page - 1) * limit, page * limit);
                    break;
                }
                case 'ORGANIZATION': {
                    const all = await this.prisma.working.organization.findMany({
                        where: { isActive: true }, select: { id: true, name: true, createdAt: true },
                        orderBy: { createdAt: 'asc' },
                    });
                    const unassigned = all.filter((e) => !ownedSet.has(e.id));
                    total = unassigned.length;
                    entities = unassigned.slice((page - 1) * limit, page * limit);
                    break;
                }
                case 'QUOTATION': {
                    const all = await this.prisma.working.quotation.findMany({
                        select: { id: true, quotationNo: true, status: true, createdAt: true },
                        orderBy: { createdAt: 'asc' },
                    });
                    const unassigned = all.filter((e) => !ownedSet.has(e.id));
                    total = unassigned.length;
                    entities = unassigned.slice((page - 1) * limit, page * limit);
                    break;
                }
            }
            return { data: entities, total, page, limit, entityType: query.entityType };
        }
        catch (error) {
            this.logger.error(`GetUnassignedEntitiesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetUnassignedEntitiesHandler = GetUnassignedEntitiesHandler;
exports.GetUnassignedEntitiesHandler = GetUnassignedEntitiesHandler = GetUnassignedEntitiesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_unassigned_entities_query_1.GetUnassignedEntitiesQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetUnassignedEntitiesHandler);
//# sourceMappingURL=get-unassigned-entities.handler.js.map