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
exports.RecalcCapacityHandler = exports.ExpireOwnershipHandler = exports.EscalateUnattendedHandler = exports.RevertDelegationsHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let RevertDelegationsHandler = class RevertDelegationsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'REVERT_DELEGATIONS';
    }
    async execute() {
        const expired = await this.prisma.delegationRecord.findMany({
            where: { endDate: { lte: new Date() }, isActive: true, isReverted: false },
        });
        let succeeded = 0;
        for (const record of expired) {
            try {
                await this.prisma.delegationRecord.update({
                    where: { id: record.id },
                    data: { isReverted: true, isActive: false },
                });
                succeeded++;
            }
            catch { }
        }
        return { recordsProcessed: expired.length, recordsSucceeded: succeeded };
    }
};
exports.RevertDelegationsHandler = RevertDelegationsHandler;
exports.RevertDelegationsHandler = RevertDelegationsHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RevertDelegationsHandler);
let EscalateUnattendedHandler = class EscalateUnattendedHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'ESCALATE_UNATTENDED';
    }
    async execute() {
        const rules = await this.prisma.working.assignmentRule.findMany({
            where: { isActive: true, escalateAfterHours: { not: null } },
        });
        let processed = 0;
        for (const rule of rules) {
            if (!rule.escalateAfterHours || !rule.escalateToUserId)
                continue;
            const cutoff = new Date(Date.now() - rule.escalateAfterHours * 3600000);
            const stale = await this.prisma.working.entityOwner.findMany({
                where: {
                    entityType: rule.entityType, ownerType: 'PRIMARY_OWNER',
                    isActive: true, createdAt: { lte: cutoff },
                },
                take: 10,
            });
            processed += stale.length;
        }
        return { recordsProcessed: processed };
    }
};
exports.EscalateUnattendedHandler = EscalateUnattendedHandler;
exports.EscalateUnattendedHandler = EscalateUnattendedHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EscalateUnattendedHandler);
let ExpireOwnershipHandler = class ExpireOwnershipHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'EXPIRE_OWNERSHIP';
    }
    async execute() {
        const expired = await this.prisma.working.entityOwner.findMany({
            where: { validTo: { lte: new Date() }, isActive: true },
        });
        for (const owner of expired) {
            await this.prisma.working.entityOwner.update({
                where: { id: owner.id },
                data: { isActive: false },
            });
        }
        return { recordsProcessed: expired.length, recordsSucceeded: expired.length };
    }
};
exports.ExpireOwnershipHandler = ExpireOwnershipHandler;
exports.ExpireOwnershipHandler = ExpireOwnershipHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpireOwnershipHandler);
let RecalcCapacityHandler = class RecalcCapacityHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'RECALC_CAPACITY';
    }
    async execute() {
        const capacities = await this.prisma.userCapacity.findMany();
        for (const cap of capacities) {
            const counts = await Promise.all([
                this.prisma.working.entityOwner.count({ where: { userId: cap.userId, entityType: 'LEAD', isActive: true } }),
                this.prisma.working.entityOwner.count({ where: { userId: cap.userId, entityType: 'CONTACT', isActive: true } }),
                this.prisma.working.entityOwner.count({ where: { userId: cap.userId, entityType: 'ORGANIZATION', isActive: true } }),
                this.prisma.working.entityOwner.count({ where: { userId: cap.userId, entityType: 'QUOTATION', isActive: true } }),
            ]);
            const total = counts.reduce((a, b) => a + b, 0);
            await this.prisma.userCapacity.update({
                where: { userId: cap.userId },
                data: {
                    activeLeads: counts[0], activeContacts: counts[1],
                    activeOrganizations: counts[2], activeQuotations: counts[3],
                    activeTotal: total,
                },
            });
        }
        return { recordsProcessed: capacities.length, recordsSucceeded: capacities.length };
    }
};
exports.RecalcCapacityHandler = RecalcCapacityHandler;
exports.RecalcCapacityHandler = RecalcCapacityHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecalcCapacityHandler);
//# sourceMappingURL=ownership-handlers.js.map