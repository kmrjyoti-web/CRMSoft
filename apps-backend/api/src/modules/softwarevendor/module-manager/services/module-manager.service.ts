import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { TenantModuleStatus, CredentialValidationStatus } from '@prisma/platform-client';

@Injectable()
export class ModuleManagerService {
  private readonly logger = new Logger(ModuleManagerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /* ───────────────────────── LIST ───────────────────────── */

  async listTenantModules(tenantId: string) {
    const [definitions, tenantModules] = await Promise.all([
      this.prisma.platform.moduleDefinition.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.platform.tenantModule.findMany({
        where: { tenantId },
      }),
    ]);

    const tenantMap = new Map(
      tenantModules.map((tm) => [tm.moduleId, tm]),
    );

    return definitions.map((def) => {
      const tm = tenantMap.get(def.id);

      let effectiveStatus: string;
      if (!tm) {
        effectiveStatus = 'NOT_INSTALLED';
      } else if (
        tm.status === TenantModuleStatus.TRIAL &&
        tm.trialEndsAt &&
        tm.trialEndsAt < new Date()
      ) {
        effectiveStatus = 'EXPIRED';
      } else {
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
        // tenant-specific
        status: effectiveStatus,
        enabledAt: tm?.enabledAt ?? null,
        trialEndsAt: tm?.trialEndsAt ?? null,
        credentialsStatus: tm?.credentialsStatus ?? CredentialValidationStatus.NOT_SET,
        enabledBy: tm?.enabledBy ?? null,
      };
    });
  }

  /* ───────────────────────── STATUS ─────────────────────── */

  async getModuleStatus(tenantId: string, moduleCode: string) {
    const definition = await this.findDefinitionByCode(moduleCode);

    const tm = await this.prisma.platform.tenantModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
    });

    let effectiveStatus: string;
    if (!tm) {
      effectiveStatus = 'NOT_INSTALLED';
    } else if (
      tm.status === TenantModuleStatus.TRIAL &&
      tm.trialEndsAt &&
      tm.trialEndsAt < new Date()
    ) {
      effectiveStatus = 'EXPIRED';
    } else {
      effectiveStatus = tm.status;
    }

    return {
      code: definition.code,
      name: definition.name,
      status: effectiveStatus,
      enabledAt: tm?.enabledAt ?? null,
      trialEndsAt: tm?.trialEndsAt ?? null,
      credentialsStatus: tm?.credentialsStatus ?? CredentialValidationStatus.NOT_SET,
      requiresCredentials: definition.requiresCredentials,
      credentialSchema: definition.credentialSchema,
    };
  }

  /* ───────────────────────── ENABLE ─────────────────────── */

  async enableModule(tenantId: string, moduleCode: string, userId: string) {
    const definition = await this.findDefinitionByCode(moduleCode);

    // Collect all modules to enable (the requested one + auto-enables)
    const toEnable = await this.resolveAutoEnables(definition);

    const results: Array<{ code: string; status: string }> = [];

    for (const def of toEnable) {
      const existing = await this.prisma.platform.tenantModule.findUnique({
        where: { tenantId_moduleId: { tenantId, moduleId: def.id } },
      });

      if (existing && existing.status === TenantModuleStatus.ACTIVE) {
        results.push({ code: def.code, status: 'ALREADY_ACTIVE' });
        continue;
      }

      const trialEndsAt =
        def.trialDays > 0
          ? new Date(Date.now() + def.trialDays * 24 * 60 * 60 * 1000)
          : null;

      const status =
        def.trialDays > 0
          ? TenantModuleStatus.TRIAL
          : TenantModuleStatus.ACTIVE;

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
      this.logger.log(
        `Module ${def.code} enabled for tenant ${tenantId} by user ${userId}`,
      );
    }

    return results;
  }

  /* ───────────────────────── DISABLE ────────────────────── */

  async disableModule(tenantId: string, moduleCode: string) {
    const definition = await this.findDefinitionByCode(moduleCode);

    // Core modules cannot be disabled
    if (definition.isCore) {
      throw new BadRequestException(
        `Module "${moduleCode}" is a core module and cannot be disabled`,
      );
    }

    // Check if any other active module depends on this one (via autoEnables)
    const allDefinitions = await this.prisma.platform.moduleDefinition.findMany({
      where: { isActive: true },
    });

    const tenantModules = await this.prisma.platform.tenantModule.findMany({
      where: {
        tenantId,
        status: { in: [TenantModuleStatus.ACTIVE, TenantModuleStatus.TRIAL] },
      },
    });

    const activeCodes = new Set(
      tenantModules.map((tm) => {
        const def = allDefinitions.find((d) => d.id === tm.moduleId);
        return def?.code;
      }).filter(Boolean),
    );

    // Find modules that list this module in their autoEnables and are currently active
    const dependents = allDefinitions.filter(
      (d) =>
        d.code !== moduleCode &&
        (d.autoEnables as string[]).includes(moduleCode) &&
        activeCodes.has(d.code),
    );

    if (dependents.length > 0) {
      const names = dependents.map((d) => d.name).join(', ');
      throw new ConflictException(
        `Cannot disable "${moduleCode}" because the following active modules depend on it: ${names}`,
      );
    }

    const existing = await this.prisma.platform.tenantModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
    });

    if (!existing) {
      throw new NotFoundException(
        `Module "${moduleCode}" is not installed for this tenant`,
      );
    }

    await this.prisma.platform.tenantModule.delete({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
    });

    this.logger.log(`Module ${moduleCode} disabled for tenant ${tenantId}`);

    return { code: moduleCode, status: 'DISABLED' };
  }

  /* ───────────────────── CREDENTIALS ────────────────────── */

  async updateCredentials(
    tenantId: string,
    moduleCode: string,
    credentials: Record<string, any>,
  ) {
    const definition = await this.findDefinitionByCode(moduleCode);

    if (!definition.requiresCredentials) {
      throw new BadRequestException(
        `Module "${moduleCode}" does not require credentials`,
      );
    }

    const tm = await this.prisma.platform.tenantModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
    });

    if (!tm) {
      throw new NotFoundException(
        `Module "${moduleCode}" is not installed for this tenant`,
      );
    }

    // Store credentials as JSON string (encryption should be handled at application layer)
    const credentialsEnc = JSON.stringify(credentials);

    await this.prisma.platform.tenantModule.update({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
      data: {
        credentialsEnc,
        credentialsStatus: CredentialValidationStatus.VALID,
        credentialsValidatedAt: new Date(),
      },
    });

    this.logger.log(
      `Credentials updated for module ${moduleCode}, tenant ${tenantId}`,
    );

    return { code: moduleCode, credentialsStatus: 'VALID' };
  }

  async validateCredentials(tenantId: string, moduleCode: string) {
    const definition = await this.findDefinitionByCode(moduleCode);

    const tm = await this.prisma.platform.tenantModule.findUnique({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
    });

    if (!tm) {
      throw new NotFoundException(
        `Module "${moduleCode}" is not installed for this tenant`,
      );
    }

    if (!tm.credentialsEnc) {
      throw new BadRequestException(
        `No credentials set for module "${moduleCode}"`,
      );
    }

    // Update the validation timestamp
    await this.prisma.platform.tenantModule.update({
      where: { tenantId_moduleId: { tenantId, moduleId: definition.id } },
      data: {
        credentialsValidatedAt: new Date(),
        credentialsStatus: CredentialValidationStatus.VALID,
      },
    });

    return {
      code: moduleCode,
      credentialsStatus: 'VALID',
      validatedAt: new Date(),
    };
  }

  /* ─────────────────── ENABLED CODES ────────────────────── */

  async getEnabledModuleCodes(tenantId: string): Promise<string[]> {
    const tenantModules = await this.prisma.platform.tenantModule.findMany({
      where: {
        tenantId,
        status: { in: [TenantModuleStatus.ACTIVE, TenantModuleStatus.TRIAL] },
      },
      include: { module: true },
    });

    // Filter out expired trials
    return tenantModules
      .filter((tm) => {
        if (
          tm.status === TenantModuleStatus.TRIAL &&
          tm.trialEndsAt &&
          tm.trialEndsAt < new Date()
        ) {
          return false;
        }
        return true;
      })
      .map((tm) => tm.module.code);
  }

  /* ─────────────────── PRIVATE HELPERS ──────────────────── */

  private async findDefinitionByCode(code: string) {
    const definition = await this.prisma.platform.moduleDefinition.findUnique({
      where: { code },
    });

    if (!definition) {
      throw new NotFoundException(`Module definition "${code}" not found`);
    }

    return definition;
  }

  /**
   * Recursively resolves all modules that should be auto-enabled
   * when enabling the given module definition.
   */
  private async resolveAutoEnables(
    definition: { id: string; code: string; autoEnables: string[]; trialDays: number },
    visited = new Set<string>(),
  ) {
    const result: Array<{ id: string; code: string; autoEnables: string[]; trialDays: number }> = [];

    if (visited.has(definition.code)) return result;
    visited.add(definition.code);

    // First enable auto-dependencies
    for (const depCode of definition.autoEnables) {
      const depDef = await this.prisma.platform.moduleDefinition.findUnique({
        where: { code: depCode },
      });
      if (depDef) {
        const nested = await this.resolveAutoEnables(depDef, visited);
        result.push(...nested);
      }
    }

    // Then add the module itself
    result.push(definition);

    return result;
  }
}
