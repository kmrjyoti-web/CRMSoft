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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipEngine = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../prisma/prisma.service");
const ACTION_LEVEL = {
    delete: [working_client_1.OwnerType.PRIMARY_OWNER],
    create: [working_client_1.OwnerType.PRIMARY_OWNER, working_client_1.OwnerType.CO_OWNER],
    update: [working_client_1.OwnerType.PRIMARY_OWNER, working_client_1.OwnerType.CO_OWNER, working_client_1.OwnerType.DELEGATED_OWNER],
    read: [working_client_1.OwnerType.PRIMARY_OWNER, working_client_1.OwnerType.CO_OWNER, working_client_1.OwnerType.DELEGATED_OWNER, working_client_1.OwnerType.WATCHER],
};
let OwnershipEngine = class OwnershipEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async check(ctx) {
        if (ctx.roleLevel <= 1)
            return true;
        if (!ctx.resourceType || !ctx.resourceId)
            return true;
        const entityType = this.mapResourceToEntityType(ctx.resourceType);
        if (!entityType)
            return true;
        const actionSuffix = ctx.action.split(':').pop() || '';
        const allowedTypes = ACTION_LEVEL[actionSuffix] || ACTION_LEVEL.read;
        const ownership = await this.prisma.entityOwner.findFirst({
            where: {
                entityType,
                entityId: ctx.resourceId,
                userId: ctx.userId,
                ownerType: { in: allowedTypes },
                isActive: true,
                OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
            },
        });
        return !!ownership;
    }
    async isPrimaryOwner(userId, resourceType, entityId) {
        const mapped = this.mapResourceToEntityType(resourceType);
        if (!mapped)
            return false;
        const owner = await this.prisma.entityOwner.findFirst({
            where: { entityType: mapped, entityId, userId, ownerType: working_client_1.OwnerType.PRIMARY_OWNER, isActive: true },
        });
        return !!owner;
    }
    async getOwners(resourceType, entityId) {
        const mapped = this.mapResourceToEntityType(resourceType);
        if (!mapped)
            return [];
        return this.prisma.entityOwner.findMany({
            where: {
                entityType: mapped,
                entityId,
                isActive: true,
                OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
            },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
    }
    mapResourceToEntityType(resourceType) {
        const mapping = {
            lead: working_client_1.EntityType.LEAD,
            contact: working_client_1.EntityType.CONTACT,
            raw_contact: working_client_1.EntityType.RAW_CONTACT,
            organization: working_client_1.EntityType.ORGANIZATION,
            quotation: working_client_1.EntityType.QUOTATION,
            ticket: working_client_1.EntityType.TICKET,
        };
        return mapping[resourceType.toLowerCase()] || null;
    }
};
exports.OwnershipEngine = OwnershipEngine;
exports.OwnershipEngine = OwnershipEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OwnershipEngine);
//# sourceMappingURL=ownership.engine.js.map