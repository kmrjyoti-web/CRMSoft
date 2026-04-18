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
var ModuleManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManagerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const platform_client_1 = require("@prisma/platform-client");
let ModuleManagerService = ModuleManagerService_1 = class ModuleManagerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ModuleManagerService_1.name);
    }
    async listTenantModules(tenantId) {
        const [definitions, tenantModules] = await Promise.all([
            this.prisma.platform.moduleDefinition.findMany({
                where: { isActive: true },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            }),
            this.prisma.platform.tenantModule.findMany({
                where: { tenantId },
            }),
        ]);
        const tenantMap = new Map(tenantModules.map((tm) => [tm.moduleId, tm]));
        return definitions.map((def) => {
            const tm = tenantMap.get(def.id);
            let effectiveStatus;
            if (!tm) {
                effectiveStatus = 'NOT_INSTALLED';
            }
            else if (tm.status === platform_client_1.TenantModuleStatus.TRIAL &&
                tm.trialEndsAt &&
                tm.trialEndsAt < new Date()) {
                effectiveStatus = 'EXPIRED';
            }
            else {
                effectiveStatus = tm.status;
            }
            return {
                moduleId: def.id,
                code: def.code,
                name: def.name,
                description: def.description,
                category: def.category,
                isCore: def.isCore,
                iconName: def.iconName,
                dependsOn: def.dependsOn,
                autoEnables: def.autoEnables,
                requiresCredentials: def.requiresCredentials,
                credentialSchema: def.credentialSchema,
                isFreeInBase: def.isFreeInBase,
                priceMonthly: def.priceMonthly,
                priceYearly: def.priceYearly,
                trialDays: def.trialDays,
                status: effectiveStatus,
                enabledAt: tm?.enabledAt ?? null,
                trialEndsAt: tm?.trialEndsAt ?? null,
                credentialsStatus: tm?.credentialsStatus ?? platform_client_1.CredentialValidationStatus.NOT_SET,
                enabledBy: tm?.enabledBy ?? null,
            };
        });
    }
    async getModuleStatus(tenantId, moduleCode) {
        const definition = await this.findDefinitionByCode(moduleCode);
        const tm = await this.prisma.platform.tenantModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
        });
        let effectiveStatus;
        if (!tm) {
            effectiveStatus = 'NOT_INSTALLED';
        }
        else if (tm.status === platform_client_1.TenantModuleStatus.TRIAL &&
            tm.trialEndsAt &&
            tm.trialEndsAt < new Date()) {
            effectiveStatus = 'EXPIRED';
        }
        else {
            effectiveStatus = tm.status;
        }
        return {
            code: definition.code,
            name: definition.name,
            status: effectiveStatus,
            enabledAt: tm?.enabledAt ?? null,
            trialEndsAt: tm?.trialEndsAt ?? null,
            credentialsStatus: tm?.credentialsStatus ?? platform_client_1.CredentialValidationStatus.NOT_SET,
            requiresCredentials: definition.requiresCredentials,
            credentialSchema: definition.credentialSchema,
        };
    }
    async enableModule(tenantId, moduleCode, userId) {
        const definition = await this.findDefinitionByCode(moduleCode);
        const toEnable = await this.resolveAutoEnables(definition);
        const results = [];
        for (const def of toEnable) {
            const existing = await this.prisma.platform.tenantModule.findUnique({
                where: { tenantId_moduleId: { tenantId, moduleId: def.id } },
            });
            if (existing && existing.status === platform_client_1.TenantModuleStatus.ACTIVE) {
                results.push({ code: def.code, status: 'ALREADY_ACTIVE' });
                continue;
            }
            const trialEndsAt = def.trialDays > 0
                ? new Date(Date.now() + def.trialDays * 24 * 60 * 60 * 1000)
                : null;
            const status = def.trialDays > 0
                ? platform_client_1.TenantModuleStatus.TRIAL
                : platform_client_1.TenantModuleStatus.ACTIVE;
            await this.prisma.platform.tenantModule.upsert({
                where: { tenantId_moduleId: { tenantId, moduleId: def.id } },
                create: {
                    tenantId,
                    moduleId: def.id,
                    status,
                    trialEndsAt,
                    enabledBy: userId,
                },
                update: {
                    status,
                    trialEndsAt,
                    enabledBy: userId,
                    enabledAt: new Date(),
                },
            });
            results.push({ code: def.code, status: status });
            this.logger.log(`Module ${def.code} enabled for tenant ${tenantId} by user ${userId}`);
        }
        return results;
    }
    async disableModule(tenantId, moduleCode) {
        const definition = await this.findDefinitionByCode(moduleCode);
        if (definition.isCore) {
            throw new common_1.BadRequestException(`Module "${moduleCode}" is a core module and cannot be disabled`);
        }
        const allDefinitions = await this.prisma.platform.moduleDefinition.findMany({
            where: { isActive: true },
        });
        const tenantModules = await this.prisma.platform.tenantModule.findMany({
            where: {
                tenantId,
                status: { in: [platform_client_1.TenantModuleStatus.ACTIVE, platform_client_1.TenantModuleStatus.TRIAL] },
            },
        });
        const activeCodes = new Set(tenantModules.map((tm) => {
            const def = allDefinitions.find((d) => d.id === tm.moduleId);
            return def?.code;
        }).filter(Boolean));
        const dependents = allDefinitions.filter((d) => d.code !== moduleCode &&
            d.autoEnables.includes(moduleCode) &&
            activeCodes.has(d.code));
        if (dependents.length > 0) {
            const names = dependents.map((d) => d.name).join(', ');
            throw new common_1.ConflictException(`Cannot disable "${moduleCode}" because the following active modules depend on it: ${names}`);
        }
        const existing = await this.prisma.platform.tenantModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Module "${moduleCode}" is not installed for this tenant`);
        }
        await this.prisma.platform.tenantModule.delete({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
        });
        this.logger.log(`Module ${moduleCode} disabled for tenant ${tenantId}`);
        return { code: moduleCode, status: 'DISABLED' };
    }
    async updateCredentials(tenantId, moduleCode, credentials) {
        const definition = await this.findDefinitionByCode(moduleCode);
        if (!definition.requiresCredentials) {
            throw new common_1.BadRequestException(`Module "${moduleCode}" does not require credentials`);
        }
        const tm = await this.prisma.platform.tenantModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
        });
        if (!tm) {
            throw new common_1.NotFoundException(`Module "${moduleCode}" is not installed for this tenant`);
        }
        const credentialsEnc = JSON.stringify(credentials);
        await this.prisma.platform.tenantModule.update({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
            data: {
                credentialsEnc,
                credentialsStatus: platform_client_1.CredentialValidationStatus.VALID,
                credentialsValidatedAt: new Date(),
            },
        });
        this.logger.log(`Credentials updated for module ${moduleCode}, tenant ${tenantId}`);
        return { code: moduleCode, credentialsStatus: 'VALID' };
    }
    async validateCredentials(tenantId, moduleCode) {
        const definition = await this.findDefinitionByCode(moduleCode);
        const tm = await this.prisma.platform.tenantModule.findUnique({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
        });
        if (!tm) {
            throw new common_1.NotFoundException(`Module "${moduleCode}" is not installed for this tenant`);
        }
        if (!tm.credentialsEnc) {
            throw new common_1.BadRequestException(`No credentials set for module "${moduleCode}"`);
        }
        await this.prisma.platform.tenantModule.update({
            where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
            data: {
                credentialsValidatedAt: new Date(),
                credentialsStatus: platform_client_1.CredentialValidationStatus.VALID,
            },
        });
        return {
            code: moduleCode,
            credentialsStatus: 'VALID',
            validatedAt: new Date(),
        };
    }
    async getEnabledModuleCodes(tenantId) {
        const tenantModules = await this.prisma.platform.tenantModule.findMany({
            where: {
                tenantId,
                status: { in: [platform_client_1.TenantModuleStatus.ACTIVE, platform_client_1.TenantModuleStatus.TRIAL] },
            },
            include: { module: true },
        });
        return tenantModules
            .filter((tm) => {
            if (tm.status === platform_client_1.TenantModuleStatus.TRIAL &&
                tm.trialEndsAt &&
                tm.trialEndsAt < new Date()) {
                return false;
            }
            return true;
        })
            .map((tm) => tm.module.code);
    }
    async findDefinitionByCode(code) {
        const definition = await this.prisma.platform.moduleDefinition.findUnique({
            where: { code },
        });
        if (!definition) {
            throw new common_1.NotFoundException(`Module definition "${code}" not found`);
        }
        return definition;
    }
    async resolveAutoEnables(definition, visited = new Set()) {
        const result = [];
        if (visited.has(definition.code))
            return result;
        visited.add(definition.code);
        for (const depCode of definition.autoEnables) {
            const depDef = await this.prisma.platform.moduleDefinition.findUnique({
                where: { code: depCode },
            });
            if (depDef) {
                const nested = await this.resolveAutoEnables(depDef, visited);
                result.push(...nested);
            }
        }
        result.push(definition);
        return result;
    }
};
exports.ModuleManagerService = ModuleManagerService;
exports.ModuleManagerService = ModuleManagerService = ModuleManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModuleManagerService);
//# sourceMappingURL=module-manager.service.js.map