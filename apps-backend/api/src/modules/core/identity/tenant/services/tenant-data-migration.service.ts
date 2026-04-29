import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { PrismaClientFactory } from '../../../../../common/database/prisma-client-factory.service';

const BATCH_SIZE = 100;

// Ordered by FK dependency — parents before children
const MIGRATION_TABLE_GROUPS: { name: string; tables: string[] }[] = [
  { name: 'config',         tables: ['gv_cfg_company_profiles', 'gv_cfg_business_locations', 'gv_cfg_auto_number_sequences'] },
  { name: 'custom_fields',  tables: ['gv_cfg_custom_field_definitions', 'gv_cfg_entity_config_values'] },
  { name: 'contacts',       tables: ['gv_crm_contacts', 'gv_crm_contact_organizations'] },
  { name: 'leads',          tables: ['gv_crm_leads'] },
  { name: 'activities',     tables: ['gv_crm_activities', 'gv_crm_follow_ups', 'gv_crm_calendar_events'] },
  { name: 'tasks',          tables: ['gv_crm_tasks', 'gv_crm_task_history'] },
  { name: 'communications', tables: ['gv_crm_communications', 'gv_crm_comments'] },
  { name: 'products',       tables: ['gv_inv_products', 'gv_inv_product_prices'] },
  { name: 'quotations',     tables: ['gv_sal_quotations', 'gv_sal_quotation_line_items'] },
  { name: 'orders',         tables: ['gv_sal_orders', 'gv_sal_order_items'] },
  { name: 'invoices',       tables: ['gv_acc_invoices', 'gv_acc_invoice_line_items'] },
  { name: 'transactions',   tables: ['gv_acc_transactions', 'gv_acc_credit_notes'] },
  { name: 'documents',      tables: ['gv_doc_folders', 'gv_doc_documents', 'gv_doc_attachments'] },
  { name: 'workflows',      tables: ['gv_wf_workflows', 'gv_wf_instances', 'gv_wf_history'] },
  { name: 'notifications',  tables: ['gv_not_notifications', 'gv_not_reminders'] },
];

export interface TableMigrationStats {
  table: string;
  totalRows: number;
  migratedRows: number;
  skippedRows: number;
  errors: number;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
}

export interface MigrationProgress {
  tenantId: string;
  status: 'idle' | 'running' | 'complete' | 'failed';
  currentGroup: string | null;
  currentTable: string | null;
  totalGroups: number;
  completedGroups: number;
  tables: TableMigrationStats[];
  totalRows: number;
  migratedRows: number;
  totalErrors: number;
  startedAt: Date | null;
  completedAt: Date | null;
  durationMs: number | null;
  errorMessage: string | null;
}

export interface MigrationResult {
  tables: TableMigrationStats[];
  totalRows: number;
  migratedRows: number;
  totalErrors: number;
  durationMs: number;
}

@Injectable()
export class TenantDataMigrationService {
  private readonly logger = new Logger(TenantDataMigrationService.name);
  private readonly progressMap = new Map<string, MigrationProgress>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: PrismaClientFactory,
  ) {}

  // ─── 1. Run full migration (SharedDB → DedicatedDB) ────────────────────────

  async migrateToDeicatedDb(tenantId: string): Promise<MigrationResult> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, dbStrategy: true, dbConnectionEncrypted: true } as any,
    }).catch(() => null) as any;

    if (!tenant) throw new BadRequestException(`Tenant ${tenantId} not found.`);

    if (!['DEDICATED', 'SEEDING'].includes(tenant.dbStrategy)) {
      throw new BadRequestException(
        `Tenant must have a configured dedicated DB before data migration. Current state: ${tenant.dbStrategy}. ` +
        `Complete steps: confirm connection → run schema migrations → seed → then migrate data.`,
      );
    }

    const existing = this.progressMap.get(tenantId);
    if (existing?.status === 'running') {
      throw new BadRequestException(`Migration already in progress for tenant ${tenantId}.`);
    }

    // Set tenant to MIGRATING
    await this.prisma.identity.tenant.update({
      where: { id: tenantId },
      data: { dbStrategy: 'MIGRATING' } as any,
    });

    const allTableStats: TableMigrationStats[] = MIGRATION_TABLE_GROUPS.flatMap((g) =>
      g.tables.map((t) => ({
        table: t,
        totalRows: 0,
        migratedRows: 0,
        skippedRows: 0,
        errors: 0,
        status: 'pending' as const,
      })),
    );

    const progress: MigrationProgress = {
      tenantId,
      status: 'running',
      currentGroup: null,
      currentTable: null,
      totalGroups: MIGRATION_TABLE_GROUPS.length,
      completedGroups: 0,
      tables: allTableStats,
      totalRows: 0,
      migratedRows: 0,
      totalErrors: 0,
      startedAt: new Date(),
      completedAt: null,
      durationMs: null,
      errorMessage: null,
    };
    this.progressMap.set(tenantId, progress);

    const startTime = Date.now();

    try {
      const sourceDb = this.prisma.working;
      const targetDb = await this.factory.getClient(tenantId);

      // Discover which tables actually exist in the source DB
      const existingTables = await this.getExistingTables(sourceDb);

      for (let gi = 0; gi < MIGRATION_TABLE_GROUPS.length; gi++) {
        const group = MIGRATION_TABLE_GROUPS[gi];
        progress.currentGroup = group.name;

        for (const tableName of group.tables) {
          const stats = allTableStats.find((s) => s.table === tableName)!;

          if (!existingTables.has(tableName)) {
            stats.status = 'complete';
            stats.totalRows = 0;
            continue;
          }

          stats.status = 'in_progress';
          progress.currentTable = tableName;

          try {
            const count = await this.countRows(sourceDb, tableName, tenantId);
            stats.totalRows = count;
            progress.totalRows += count;

            let offset = 0;
            while (offset < count) {
              const rows = await this.fetchRows(sourceDb, tableName, tenantId, BATCH_SIZE, offset);
              if (rows.length === 0) break;

              const inserted = await this.insertRows(targetDb, tableName, rows);
              stats.migratedRows += inserted;
              stats.skippedRows += rows.length - inserted;
              progress.migratedRows += inserted;
              offset += rows.length;
            }

            stats.status = 'complete';
            this.logger.log(`[${tenantId}] Migrated ${tableName}: ${stats.migratedRows}/${stats.totalRows} rows`);
          } catch (err) {
            stats.errors++;
            stats.status = 'failed';
            progress.totalErrors++;
            this.logger.error(`[${tenantId}] Error migrating ${tableName}: ${(err as Error).message}`);
          }
        }

        progress.completedGroups = gi + 1;
      }

      // Mark as DEDICATED + ACTIVE on success
      await this.prisma.identity.tenant.update({
        where: { id: tenantId },
        data: { dbStrategy: 'DEDICATED', status: 'ACTIVE' } as any,
      });

      progress.status = 'complete';
      progress.completedAt = new Date();
      progress.durationMs = Date.now() - startTime;
      progress.currentGroup = null;
      progress.currentTable = null;

      this.logger.log(
        `[${tenantId}] Migration complete — ${progress.migratedRows} rows across ` +
        `${allTableStats.filter((s) => s.migratedRows > 0).length} tables in ${progress.durationMs}ms`,
      );

      return {
        tables: allTableStats,
        totalRows: progress.totalRows,
        migratedRows: progress.migratedRows,
        totalErrors: progress.totalErrors,
        durationMs: progress.durationMs,
      };
    } catch (err) {
      // Roll back to DEDICATED (still has connection, just migration failed)
      await this.prisma.identity.tenant.update({
        where: { id: tenantId },
        data: { dbStrategy: 'DEDICATED' } as any,
      }).catch(() => null);

      progress.status = 'failed';
      progress.completedAt = new Date();
      progress.durationMs = Date.now() - startTime;
      progress.errorMessage = (err as Error).message;
      throw err;
    }
  }

  // ─── 2. Migration progress ────────────────────────────────────────────────

  getMigrationProgress(tenantId: string): MigrationProgress | null {
    return this.progressMap.get(tenantId) ?? null;
  }

  // ─── 3. Cleanup shared DB data (admin-confirmed, 30-day post-migration) ──

  async cleanupSharedDbData(tenantId: string): Promise<{ deletedFrom: string[]; totalDeleted: number }> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: { dbStrategy: true } as any,
    }).catch(() => null) as any;

    if (!tenant || tenant.dbStrategy !== 'DEDICATED') {
      throw new BadRequestException(
        'Cleanup only allowed after successful migration to dedicated DB (dbStrategy must be DEDICATED).',
      );
    }

    const existingTables = await this.getExistingTables(this.prisma.working);
    const allTables = MIGRATION_TABLE_GROUPS.flatMap((g) => g.tables);
    const deletedFrom: string[] = [];
    let totalDeleted = 0;

    // Delete in reverse dependency order (children before parents)
    for (const tableName of [...allTables].reverse()) {
      if (!existingTables.has(tableName)) continue;
      try {
        const result = await (this.prisma.working as any).$executeRawUnsafe(
          `DELETE FROM "${tableName}" WHERE tenant_id = $1`,
          tenantId,
        );
        if (result > 0) {
          deletedFrom.push(tableName);
          totalDeleted += result;
        }
      } catch {
        this.logger.warn(`Cleanup: could not delete from ${tableName} for tenant ${tenantId}`);
      }
    }

    this.logger.log(`[${tenantId}] Shared DB cleanup: ${totalDeleted} rows deleted from ${deletedFrom.length} tables`);
    return { deletedFrom, totalDeleted };
  }

  // ─── Raw SQL helpers ──────────────────────────────────────────────────────

  private async getExistingTables(db: any): Promise<Set<string>> {
    const rows = await db.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ` as { table_name: string }[];
    return new Set(rows.map((r) => r.table_name));
  }

  private async countRows(db: any, table: string, tenantId: string): Promise<number> {
    const rows = await db.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM "${table}" WHERE tenant_id = $1`,
      tenantId,
    ) as { count: bigint | string }[];
    return Number(rows[0]?.count ?? 0);
  }

  private async fetchRows(db: any, table: string, tenantId: string, limit: number, offset: number): Promise<Record<string, unknown>[]> {
    return db.$queryRawUnsafe(
      `SELECT * FROM "${table}" WHERE tenant_id = $1 ORDER BY (SELECT NULL) LIMIT $2 OFFSET $3`,
      tenantId, limit, offset,
    );
  }

  private async insertRows(db: any, table: string, rows: Record<string, unknown>[]): Promise<number> {
    if (rows.length === 0) return 0;

    const cols = Object.keys(rows[0]).map((c) => `"${c}"`).join(', ');
    let inserted = 0;

    for (const row of rows) {
      const values = Object.values(row);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      try {
        await db.$executeRawUnsafe(
          `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          ...values,
        );
        inserted++;
      } catch {
        // Row already exists or constraint violation — skip
      }
    }

    return inserted;
  }
}
