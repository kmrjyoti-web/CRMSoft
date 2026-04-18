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
var SlaMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaMonitorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SlaMonitorService = SlaMonitorService_1 = class SlaMonitorService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SlaMonitorService_1.name);
    }
    async checkSlaBreaches() {
        try {
            const instances = await this.prisma.working.workflowInstance.findMany({
                where: { isActive: true },
                include: { currentState: true },
            });
            for (const instance of instances) {
                await this.processInstance(instance).catch((err) => {
                    this.logger.error(`SLA check failed for instance ${instance.id}: ${err.message}`);
                });
            }
        }
        catch (error) {
            this.logger.error(`SLA monitor run failed: ${(error instanceof Error ? error.message : String(error))}`);
        }
    }
    async processInstance(instance) {
        const metadata = instance.currentState.metadata;
        if (!metadata?.slaHours || !metadata?.escalationEnabled)
            return;
        const slaHours = Number(metadata.slaHours);
        const hoursInState = (Date.now() - new Date(instance.updatedAt).getTime()) / (1000 * 60 * 60);
        if (hoursInState <= slaHours)
            return;
        const escalationLevel = Math.min(Math.floor(hoursInState / slaHours), 3);
        const existingEscalation = await this.prisma.working.workflowSlaEscalation.findFirst({
            where: {
                instanceId: instance.id,
                stateId: instance.currentStateId,
                escalationLevel,
                isResolved: false,
            },
        });
        if (existingEscalation)
            return;
        const escalatedToId = await this.findEscalationTarget(escalationLevel);
        await this.prisma.working.workflowSlaEscalation.create({
            data: {
                instanceId: instance.id,
                stateId: instance.currentStateId,
                slaHours,
                escalatedToId,
                escalationLevel,
            },
        });
        this.logger.warn(`SLA breach: Instance ${instance.id} in state "${instance.currentState.code}" ` +
            `for ${hoursInState.toFixed(1)}h (SLA: ${slaHours}h). Level ${escalationLevel} escalation.`);
    }
    async findEscalationTarget(level) {
        const roleMap = {
            1: 'MANAGER',
            2: 'ADMIN',
            3: 'SUPER_ADMIN',
        };
        const roleName = roleMap[level] || 'SUPER_ADMIN';
        const user = await this.prisma.user.findFirst({
            where: { role: { name: roleName }, status: 'ACTIVE' },
            select: { id: true },
        });
        return user?.id || null;
    }
    async resolveEscalations(instanceId, stateId) {
        await this.prisma.working.workflowSlaEscalation.updateMany({
            where: { instanceId, stateId, isResolved: false },
            data: { isResolved: true, resolvedAt: new Date() },
        });
    }
};
exports.SlaMonitorService = SlaMonitorService;
exports.SlaMonitorService = SlaMonitorService = SlaMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SlaMonitorService);
//# sourceMappingURL=sla-monitor.service.js.map