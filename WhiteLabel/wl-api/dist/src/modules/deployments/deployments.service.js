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
exports.DeploymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let DeploymentsService = class DeploymentsService {
    prisma;
    audit;
    config;
    constructor(prisma, audit, config) {
        this.prisma = prisma;
        this.audit = audit;
        this.config = config;
    }
    async deploy(partnerId, params) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId }, include: { gitBranches: { where: { branchType: 'MAIN', isActive: true } } } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const gitBranch = partner.gitBranches[0]?.branchName || `partner/${partner.partnerCode}/main`;
        const version = params.version || new Date().toISOString().split('T')[0];
        const deployment = await this.prisma.partnerDeployment.upsert({
            where: { partnerId },
            create: { partnerId, status: 'DEPLOYING', gitBranch, currentVersion: version, deployedBy: params.deployedBy || 'admin', deployedAt: new Date() },
            update: { status: 'DEPLOYING', gitBranch, currentVersion: version, deployedBy: params.deployedBy || 'admin', deployedAt: new Date() },
        });
        const updatedDeployment = await this.prisma.partnerDeployment.update({
            where: { partnerId },
            data: { status: 'RUNNING', lastHealthCheck: new Date(), healthStatus: 'healthy' },
        });
        await this.audit.log({
            partnerId,
            action: 'PARTNER_DEPLOYED',
            performedBy: params.deployedBy || 'admin',
            performedByRole: 'MASTER_ADMIN',
            details: { version, gitBranch, gitTag: params.gitTag },
        });
        return updatedDeployment;
    }
    async rollback(partnerId, targetVersion) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const deployment = await this.prisma.partnerDeployment.update({
            where: { partnerId },
            data: { status: 'DEPLOYING', currentVersion: targetVersion, deployedAt: new Date() },
        });
        const updated = await this.prisma.partnerDeployment.update({
            where: { partnerId },
            data: { status: 'RUNNING', lastHealthCheck: new Date(), healthStatus: 'healthy' },
        });
        await this.audit.log({
            partnerId,
            action: 'PARTNER_ROLLED_BACK',
            performedBy: 'admin',
            performedByRole: 'MASTER_ADMIN',
            details: { targetVersion },
        });
        return updated;
    }
    async getDeployment(partnerId) {
        const deployment = await this.prisma.partnerDeployment.findUnique({ where: { partnerId } });
        if (!deployment)
            return { partnerId, status: 'NOT_DEPLOYED', isDeployed: false };
        return deployment;
    }
    async checkHealth(partnerId) {
        const deployment = await this.prisma.partnerDeployment.findUnique({ where: { partnerId } });
        if (!deployment)
            return { partnerId, status: 'NOT_DEPLOYED', healthy: false };
        const healthy = deployment.status === 'RUNNING';
        const healthStatus = healthy ? 'healthy' : 'degraded';
        await this.prisma.partnerDeployment.update({
            where: { partnerId },
            data: { lastHealthCheck: new Date(), healthStatus },
        });
        return { partnerId, status: deployment.status, healthy, healthStatus, lastCheck: new Date() };
    }
    async getHistory(partnerId) {
        const logs = await this.prisma.partnerAuditLog.findMany({
            where: { partnerId, action: { in: ['PARTNER_DEPLOYED', 'PARTNER_ROLLED_BACK'] } },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return logs;
    }
    async checkAllHealth() {
        const deployments = await this.prisma.partnerDeployment.findMany({
            where: { status: 'RUNNING' },
            include: { partner: { select: { partnerCode: true, companyName: true } } },
        });
        const results = await Promise.all(deployments.map(async (d) => this.checkHealth(d.partnerId)));
        return { checked: results.length, results };
    }
};
exports.DeploymentsService = DeploymentsService;
exports.DeploymentsService = DeploymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], DeploymentsService);
//# sourceMappingURL=deployments.service.js.map