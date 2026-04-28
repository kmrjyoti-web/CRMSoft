import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { PrismaClientFactory } from '../../../../../common/database/prisma-client-factory.service';

const WL_PLAN_DEDICATED_DB = new Set(['WL_PROFESSIONAL', 'WL_ENTERPRISE']);

export interface ProvisioningStatus {
  tenantId: string;
  status: string;
  dbName: string | null;
  region: string | null;
  instructionSql: string | null;
  connectionConfigured: boolean;
  createdAt: Date | null;
}

@Injectable()
export class WlDbProvisioningService {
  private readonly logger = new Logger(WlDbProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: PrismaClientFactory,
  ) {}

  // ─── Step 1: Start provisioning ───────────────────────────────────────────

  async startProvisioning(tenantId: string): Promise<{
    status: string;
    dbName: string;
    region: string;
    instructionSql: string;
  }> {
    const tenant = await this.requireTenant(tenantId);

    if (!WL_PLAN_DEDICATED_DB.has(tenant.planCode ?? '')) {
      throw new BadRequestException(
        `Dedicated DB requires WL_PROFESSIONAL or WL_ENTERPRISE plan. Current plan: ${tenant.planCode ?? 'none'}`,
      );
    }

    if (tenant.dbStrategy !== 'SHARED') {
      throw new BadRequestException(
        `Tenant is already in provisioning state: ${tenant.dbStrategy}. Cannot restart.`,
      );
    }

    const dbName = `crmsoft_${tenant.slug.replace(/[^a-z0-9]/g, '_')}_prod`;
    const region = tenant.dbRegion ?? 'ap-south-1';

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { dbStrategy: 'PROVISIONING' } as any,
    });

    const instructionSql = [
      `-- Step 1: Create the database on Railway (or any PostgreSQL host)`,
      `CREATE DATABASE ${dbName};`,
      ``,
      `-- Step 2: Note your connection string, then call:`,
      `--   POST /api/v1/pc-config/tenants/${tenantId}/provision/confirm`,
      `--   Body: { "connectionString": "postgresql://user:pass@host:5432/${dbName}" }`,
      ``,
      `-- Region (choose your Railway region closest to): ${region}`,
    ].join('\n');

    this.logger.log(`Provisioning started for tenant ${tenantId} (DB: ${dbName})`);

    return { status: 'PROVISIONING', dbName, region, instructionSql };
  }

  // ─── Step 2: Confirm connection string ───────────────────────────────────

  async confirmConnection(tenantId: string, connectionString: string): Promise<{
    status: 'DEDICATED' | 'FAILED';
    message: string;
  }> {
    const tenant = await this.requireTenant(tenantId);

    if (tenant.dbStrategy !== 'PROVISIONING') {
      throw new BadRequestException(
        `Tenant must be in PROVISIONING state to confirm connection. Current: ${tenant.dbStrategy}`,
      );
    }

    // Validate connection before storing
    const valid = await this.testConnection(connectionString);
    if (!valid.ok) {
      return { status: 'FAILED', message: `Connection test failed: ${valid.error}` };
    }

    const { encrypted, iv, tag } = this.factory.encryptConnectionString(connectionString);

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: {
        dbConnectionEncrypted: encrypted,
        dbConnectionIv: iv,
        dbConnectionTag: tag,
        dbStrategy: 'DEDICATED',
      } as any,
    });

    this.logger.log(`Dedicated DB confirmed for tenant ${tenantId}`);

    return { status: 'DEDICATED', message: 'Connection validated and stored. Tenant is now on dedicated DB.' };
  }

  // ─── Step 3: Migration SQL ────────────────────────────────────────────────

  async getMigrationSql(tenantId: string): Promise<{ sqlFilePath: string; instructions: string }> {
    const tenant = await this.requireTenant(tenantId);

    if (tenant.dbStrategy !== 'DEDICATED') {
      throw new BadRequestException(
        `Tenant must be in DEDICATED state before running migrations. Current: ${tenant.dbStrategy}`,
      );
    }

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { dbStrategy: 'MIGRATING' } as any,
    });

    const instructions = [
      `Run migrations on the new dedicated DB:`,
      `  DATABASE_URL="<your-connection-string>" npx prisma migrate deploy \\`,
      `    --schema=apps-backend/api/prisma/working/schema.prisma`,
      ``,
      `Then call POST /api/v1/pc-config/tenants/${tenantId}/provision/seed to seed default data.`,
      ``,
      `Or mark migration complete manually via:`,
      `  PATCH /api/v1/pc-config/tenants/${tenantId}/provision/status { "status": "DEDICATED" }`,
    ].join('\n');

    this.logger.log(`Migration instructions generated for tenant ${tenantId}`);

    return {
      sqlFilePath: 'apps-backend/api/prisma/working/schema.prisma',
      instructions,
    };
  }

  // ─── Step 4: Seed default data ────────────────────────────────────────────

  async seedTenantDb(tenantId: string): Promise<{ seeded: string[] }> {
    const tenant = await this.requireTenant(tenantId);

    if (tenant.dbStrategy !== 'MIGRATING' && tenant.dbStrategy !== 'DEDICATED') {
      throw new BadRequestException(
        `Tenant must be in MIGRATING or DEDICATED state to seed. Current: ${tenant.dbStrategy}`,
      );
    }

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { dbStrategy: 'SEEDING' } as any,
    });

    const db = await this.factory.getClient(tenantId);
    const seeded: string[] = [];

    // Default roles
    const existingRoles = await (db as any).role?.count({ where: { tenantId } }).catch(() => 0);
    if (!existingRoles) {
      const defaultRoles = [
        { name: 'ADMIN', displayName: 'Admin', isSystem: true },
        { name: 'MANAGER', displayName: 'Manager', isSystem: false },
        { name: 'SALES_EXECUTIVE', displayName: 'Sales Executive', isSystem: false },
        { name: 'SUPPORT_AGENT', displayName: 'Support Agent', isSystem: false },
      ];
      for (const r of defaultRoles) {
        await (db as any).role?.create({ data: { tenantId, ...r } }).catch(() => null);
      }
      seeded.push('roles');
    }

    // Default company profile
    const hasProfile = await (db as any).companyProfile?.findFirst({ where: { tenantId } }).catch(() => null);
    if (!hasProfile) {
      await (db as any).companyProfile?.create({
        data: { tenantId, companyName: tenant.name, isActive: true },
      }).catch(() => null);
      seeded.push('companyProfile');
    }

    // Default auto-number sequences
    const hasSeq = await (db as any).autoNumberSequence?.findFirst({ where: { tenantId } }).catch(() => null);
    if (!hasSeq) {
      const sequences = [
        { entityType: 'LEAD', prefix: 'LD-', nextNumber: 1 },
        { entityType: 'CONTACT', prefix: 'CON-', nextNumber: 1 },
        { entityType: 'QUOTATION', prefix: 'QT-', nextNumber: 1 },
        { entityType: 'INVOICE', prefix: 'INV-', nextNumber: 1 },
      ];
      for (const seq of sequences) {
        await (db as any).autoNumberSequence?.create({ data: { tenantId, ...seq } }).catch(() => null);
      }
      seeded.push('autoNumberSequences');
    }

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { dbStrategy: 'DEDICATED' } as any,
    });

    this.logger.log(`Tenant ${tenantId} seeded: ${seeded.join(', ')}`);

    return { seeded };
  }

  // ─── Rollback ─────────────────────────────────────────────────────────────

  async rollback(tenantId: string): Promise<{ reverted: boolean; previousStrategy: string }> {
    const tenant = await this.requireTenant(tenantId);
    const previous = tenant.dbStrategy;

    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: {
        dbStrategy: 'SHARED',
        dbConnectionEncrypted: null,
        dbConnectionIv: null,
        dbConnectionTag: null,
      } as any,
    });

    await this.factory.disconnectClient(tenantId);

    this.logger.log(`Tenant ${tenantId} rolled back from ${previous} → SHARED`);

    return { reverted: true, previousStrategy: previous };
  }

  // ─── Status ───────────────────────────────────────────────────────────────

  async getStatus(tenantId: string): Promise<ProvisioningStatus> {
    const tenant = await this.requireTenant(tenantId);

    return {
      tenantId,
      status: tenant.dbStrategy,
      dbName: tenant.slug ? `crmsoft_${tenant.slug.replace(/[^a-z0-9]/g, '_')}_prod` : null,
      region: tenant.dbRegion ?? 'ap-south-1',
      instructionSql: null,
      connectionConfigured: !!(tenant as any).dbConnectionEncrypted,
      createdAt: (tenant as any).createdAt ?? null,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async requireTenant(tenantId: string) {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        slug: true,
        name: true,
        planCode: true,
        dbStrategy: true,
        dbRegion: true,
        createdAt: true,
      } as any,
    }).catch(() => null) as any;

    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);
    return tenant;
  }

  private async testConnection(url: string): Promise<{ ok: boolean; error?: string }> {
    const { PrismaClient: WorkingClient } = await import('@prisma/working-client').catch(() => ({
      PrismaClient: null,
    }));

    if (!WorkingClient) {
      return { ok: false, error: 'WorkingClient not available' };
    }

    const client = new WorkingClient({
      datasources: { db: { url } },
    });

    try {
      await client.$connect();
      await (client as any).$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    } finally {
      await client.$disconnect().catch(() => null);
    }
  }
}
