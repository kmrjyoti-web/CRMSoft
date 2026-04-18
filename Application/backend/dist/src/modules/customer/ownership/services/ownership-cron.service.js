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
var OwnershipCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipCronService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const delegation_service_1 = require("./delegation.service");
const ownership_core_service_1 = require("./ownership-core.service");
const workload_service_1 = require("./workload.service");
let OwnershipCronService = OwnershipCronService_1 = class OwnershipCronService {
    constructor(prisma, delegation, ownershipCore, workload) {
        this.prisma = prisma;
        this.delegation = delegation;
        this.ownershipCore = ownershipCore;
        this.workload = workload;
        this.logger = new common_1.Logger(OwnershipCronService_1.name);
    }
    async autoRevertDelegations() {
        const expired = await this.prisma.delegationRecord.findMany({
            where: { endDate: { lte: new Date() }, isActive: true, isReverted: false },
        });
        for (const record of expired) {
            try {
                const result = await this.delegation.revertDelegation(record.id, 'system');
                this.logger.log(`Auto-reverted delegation ${record.id}: ${result.reverted} entities returned`);
            }
            catch (err) {
                this.logger.error(`Failed to revert delegation ${record.id}: ${err.message}`);
            }
        }
    }
    async escalateUnattended() {
        const rules = await this.prisma.working.assignmentRule.findMany({
            where: { isActive: true, escalateAfterHours: { not: null } },
        });
        for (const rule of rules) {
            if (!rule.escalateAfterHours)
                continue;
            const cutoff = new Date(Date.now() - rule.escalateAfterHours * 60 * 60 * 1000);
            const staleOwners = await this.prisma.working.entityOwner.findMany({
                where: {
                    entityType: rule.entityType, ownerType: 'PRIMARY_OWNER', isActive: true,
                    createdAt: { lte: cutoff },
                },
                take: 10,
            });
            for (const owner of staleOwners) {
                if (!owner.userId)
                    continue;
                const hasActivity = await this.prisma.working.ownershipLog.findFirst({
                    where: { entityType: owner.entityType, entityId: owner.entityId, createdAt: { gte: cutoff } },
                });
                if (hasActivity)
                    continue;
                const escalateTo = rule.escalateToUserId;
                if (!escalateTo)
                    continue;
                try {
                    await this.ownershipCore.transfer({
                        entityType: owner.entityType, entityId: owner.entityId,
                        fromUserId: owner.userId, toUserId: escalateTo,
                        ownerType: 'PRIMARY_OWNER', transferredById: 'system',
                        reason: 'ESCALATION', reasonDetail: `Unattended for ${rule.escalateAfterHours}h`,
                    });
                    this.logger.log(`Escalated ${owner.entityType}/${owner.entityId} to ${escalateTo}`);
                }
                catch (err) {
                    this.logger.error(`Escalation failed: ${err.message}`);
                }
            }
        }
    }
    async expireTimeLimitedOwnership() {
        const expired = await this.prisma.working.entityOwner.findMany({
            where: { validTo: { lte: new Date() }, isActive: true },
        });
        for (const owner of expired) {
            await this.prisma.working.entityOwner.update({ where: { id: owner.id }, data: { isActive: false } });
            await this.prisma.working.ownershipLog.create({
                data: {
                    entityType: owner.entityType, entityId: owner.entityId,
                    action: 'REVOKE', ownerType: owner.ownerType,
                    fromUserId: owner.userId, reasonCode: 'AUTO_EXPIRE',
                    changedById: owner.assignedById, changedByName: 'System',
                    isAutomated: true,
                },
            });
            if (owner.userId) {
                const field = this.getCapacityField(owner.entityType);
                if (field) {
                    await this.prisma.userCapacity.update({
                        where: { userId: owner.userId },
                        data: { [field]: { decrement: 1 }, activeTotal: { decrement: 1 } },
                    }).catch(() => { });
                }
            }
        }
        if (expired.length)
            this.logger.log(`Expired ${expired.length} time-limited ownerships`);
    }
    async recalculateAllCounts() {
        const capacities = await this.prisma.userCapacity.findMany();
        for (const cap of capacities) {
            await this.workload.recalculateCounts(cap.userId);
        }
        this.logger.log(`Recalculated counts for ${capacities.length} users`);
    }
    getCapacityField(entityType) {
        const map = {
            LEAD: 'activeLeads', CONTACT: 'activeContacts',
            ORGANIZATION: 'activeOrganizations', QUOTATION: 'activeQuotations',
        };
        return map[entityType] || null;
    }
};
exports.OwnershipCronService = OwnershipCronService;
exports.OwnershipCronService = OwnershipCronService = OwnershipCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        delegation_service_1.DelegationService,
        ownership_core_service_1.OwnershipCoreService,
        workload_service_1.WorkloadService])
], OwnershipCronService);
//# sourceMappingURL=ownership-cron.service.js.map