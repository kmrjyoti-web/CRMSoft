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
var RoundRobinService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobinService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let RoundRobinService = RoundRobinService_1 = class RoundRobinService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RoundRobinService_1.name);
    }
    async getNextUser(params) {
        const { userIds, entityType, lastAssignedIndex, respectCapacity } = params;
        if (!userIds.length)
            throw new common_1.BadRequestException('Rotation pool is empty');
        const poolSize = userIds.length;
        for (let i = 0; i < poolSize; i++) {
            const idx = (lastAssignedIndex + 1 + i) % poolSize;
            const userId = userIds[idx];
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.status !== 'ACTIVE')
                continue;
            const capacity = await this.prisma.userCapacity.findUnique({ where: { userId } });
            if (capacity && !capacity.isAvailable)
                continue;
            if (respectCapacity && capacity) {
                const field = this.getCapacityField(entityType);
                if (field) {
                    const current = capacity[field.active] || 0;
                    const max = capacity[field.max] || 200;
                    if (current >= max)
                        continue;
                }
            }
            this.logger.log(`Round-robin selected user ${userId} at index ${idx}`);
            return { userId, newIndex: idx };
        }
        for (let i = 0; i < poolSize; i++) {
            const idx = (lastAssignedIndex + 1 + i) % poolSize;
            const user = await this.prisma.user.findUnique({ where: { id: userIds[idx] } });
            if (user && user.status === 'ACTIVE') {
                return { userId: userIds[idx], newIndex: idx };
            }
        }
        throw new common_1.BadRequestException('No available users in rotation pool');
    }
    async executeForRule(ruleId, entityType, entityId) {
        const rule = await this.prisma.working.assignmentRule.findUnique({ where: { id: ruleId } });
        if (!rule)
            throw new common_1.BadRequestException('Assignment rule not found');
        const result = await this.getNextUser({
            userIds: rule.assignToTeamIds,
            entityType,
            lastAssignedIndex: rule.lastAssignedIndex,
            respectCapacity: rule.respectWorkload,
        });
        await this.prisma.working.assignmentRule.update({
            where: { id: ruleId },
            data: { lastAssignedIndex: result.newIndex },
        });
        return result.userId;
    }
    getCapacityField(entityType) {
        const map = {
            LEAD: { active: 'activeLeads', max: 'maxLeads' },
            CONTACT: { active: 'activeContacts', max: 'maxContacts' },
            ORGANIZATION: { active: 'activeOrganizations', max: 'maxOrganizations' },
            QUOTATION: { active: 'activeQuotations', max: 'maxQuotations' },
        };
        return map[entityType] || null;
    }
};
exports.RoundRobinService = RoundRobinService;
exports.RoundRobinService = RoundRobinService = RoundRobinService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoundRobinService);
//# sourceMappingURL=round-robin.service.js.map