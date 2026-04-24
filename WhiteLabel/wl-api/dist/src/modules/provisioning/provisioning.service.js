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
exports.ProvisioningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const child_process_1 = require("child_process");
const util_1 = require("util");
const config_1 = require("@nestjs/config");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ProvisioningService = class ProvisioningService {
    prisma;
    audit;
    config;
    constructor(prisma, audit, config) {
        this.prisma = prisma;
        this.audit = audit;
        this.config = config;
    }
    getDbNames(partnerCode) {
        const code = partnerCode.replace(/-/g, '_');
        return {
            identity: `identity_${code}`,
            platform: `platform_${code}`,
            working: `working_${code}`,
            marketplace: `marketplace_${code}`,
        };
    }
    async provision(partnerId) {
        const start = Date.now();
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        if (partner.dbConnectionConfig)
            throw new common_1.BadRequestException('Partner already provisioned');
        const dbNames = this.getDbNames(partner.partnerCode);
        const created = [];
        const pgUser = this.config.get('POSTGRES_USER', 'postgres');
        const pgHost = this.config.get('POSTGRES_HOST', 'localhost');
        const pgPassword = this.config.get('POSTGRES_PASSWORD', 'postgres');
        const pgPort = this.config.get('POSTGRES_PORT', '5432');
        try {
            for (const [key, dbName] of Object.entries(dbNames)) {
                try {
                    await execAsync(`PGPASSWORD=${pgPassword} createdb -h ${pgHost} -p ${pgPort} -U ${pgUser} "${dbName}" 2>/dev/null || echo "db_exists"`);
                    created.push(dbName);
                }
                catch {
                    created.push(dbName);
                }
            }
            const dbConnectionConfig = {};
            for (const [key, dbName] of Object.entries(dbNames)) {
                dbConnectionConfig[key] = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${dbName}`;
            }
            const defaultFeatures = [
                { featureCode: 'CRM_CORE', isEnabled: true },
                { featureCode: 'LEADS', isEnabled: true },
                { featureCode: 'CONTACTS', isEnabled: true },
                { featureCode: 'QUOTATIONS', isEnabled: true },
                { featureCode: 'INVOICING', isEnabled: true },
                { featureCode: 'MARKETPLACE', isEnabled: false },
                { featureCode: 'AI_WORKFLOWS', isEnabled: false },
                { featureCode: 'WHATSAPP_CHAT', isEnabled: false },
                { featureCode: 'CUSTOM_DOMAIN', isEnabled: false },
                { featureCode: 'REPORT_DESIGNER', isEnabled: true },
                { featureCode: 'WORKFLOW_BUILDER', isEnabled: true },
                { featureCode: 'MULTI_LANGUAGE', isEnabled: false },
            ];
            for (const flag of defaultFeatures) {
                await this.prisma.partnerFeatureFlag.upsert({
                    where: { partnerId_featureCode: { partnerId, featureCode: flag.featureCode } },
                    create: { partnerId, ...flag },
                    update: flag,
                });
            }
            await this.prisma.whiteLabelPartner.update({
                where: { id: partnerId },
                data: { dbConnectionConfig, status: 'ACTIVE', onboardedAt: new Date() },
            });
            await this.prisma.partnerDeployment.upsert({
                where: { partnerId },
                create: { partnerId, status: 'STOPPED', deploymentType: 'SHARED_INFRA' },
                update: { status: 'STOPPED' },
            });
            await this.audit.log({
                partnerId,
                action: 'PARTNER_PROVISIONED',
                performedBy: 'system',
                performedByRole: 'MASTER_ADMIN',
                details: { databases: created },
            });
            return { success: true, databases: created, duration: Date.now() - start };
        }
        catch (error) {
            for (const dbName of created) {
                try {
                    await execAsync(`PGPASSWORD=${pgPassword} dropdb -h ${pgHost} -p ${pgPort} -U ${pgUser} --if-exists "${dbName}"`);
                }
                catch { }
            }
            return { success: false, databases: [], duration: Date.now() - start, error: error.message };
        }
    }
    async getStatus(partnerId) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({
            where: { id: partnerId },
            include: { deployment: true, featureFlags: true },
        });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const dbConfig = partner.dbConnectionConfig;
        const databases = dbConfig
            ? Object.entries(dbConfig).map(([key, url]) => ({
                key,
                url: url.replace(/:\/\/.*@/, '://***@'),
                status: 'ACTIVE',
            }))
            : [];
        return {
            partnerId,
            isProvisioned: !!dbConfig,
            status: partner.status,
            databases,
            featureFlags: partner.featureFlags,
            deployment: partner.deployment,
        };
    }
    async deprovision(partnerId, confirmation) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        if (confirmation !== `DELETE-${partner.partnerCode}`) {
            throw new common_1.BadRequestException(`Confirmation must be "DELETE-${partner.partnerCode}"`);
        }
        const pgUser = this.config.get('POSTGRES_USER', 'postgres');
        const pgHost = this.config.get('POSTGRES_HOST', 'localhost');
        const pgPassword = this.config.get('POSTGRES_PASSWORD', 'postgres');
        const pgPort = this.config.get('POSTGRES_PORT', '5432');
        const dbNames = this.getDbNames(partner.partnerCode);
        for (const dbName of Object.values(dbNames)) {
            try {
                await execAsync(`PGPASSWORD=${pgPassword} dropdb -h ${pgHost} -p ${pgPort} -U ${pgUser} --if-exists "${dbName}"`);
            }
            catch { }
        }
        await this.prisma.whiteLabelPartner.update({
            where: { id: partnerId },
            data: { dbConnectionConfig: 'null', status: 'CANCELLED' },
        });
        await this.audit.log({
            partnerId,
            action: 'PARTNER_DEPROVISIONED',
            performedBy: 'admin',
            performedByRole: 'MASTER_ADMIN',
            details: { databases: Object.values(dbNames) },
        });
    }
    async reprovision(partnerId) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        if (partner.dbConnectionConfig) {
            await this.deprovision(partnerId, `DELETE-${partner.partnerCode}`);
        }
        await this.prisma.whiteLabelPartner.update({ where: { id: partnerId }, data: { dbConnectionConfig: 'null' } });
        return this.provision(partnerId);
    }
    async getDatabases(partnerId) {
        const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
        if (!partner)
            throw new common_1.NotFoundException('Partner not found');
        const dbConfig = partner.dbConnectionConfig;
        if (!dbConfig)
            return { provisioned: false, databases: [] };
        const databases = Object.entries(dbConfig).map(([key, url]) => ({
            key,
            dbName: url.split('/').pop(),
            connectionUrl: url.replace(/:\/\/.*@/, '://***@'),
            status: 'ACTIVE',
        }));
        return { provisioned: true, databases };
    }
};
exports.ProvisioningService = ProvisioningService;
exports.ProvisioningService = ProvisioningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], ProvisioningService);
//# sourceMappingURL=provisioning.service.js.map