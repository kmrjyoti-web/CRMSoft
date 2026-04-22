import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditFinding } from '../dto/audit-finding.dto';

interface FkConstraint {
  constraintName: string;
  childTable: string;
  childColumn: string;
  parentTable: string;
  parentColumn: string;
}

interface DbConfig {
  label: string;
  client: 'identity' | 'platform' | 'globalWorking';
}

const DBS: DbConfig[] = [
  { label: 'IdentityDB', client: 'identity' },
  { label: 'PlatformDB', client: 'platform' },
  { label: 'WorkingDB', client: 'globalWorking' },
];

const FK_QUERY = `
  SELECT
    tc.constraint_name,
    kcu.table_name AS child_table,
    kcu.column_name AS child_column,
    ccu.table_name AS parent_table,
    ccu.column_name AS parent_column
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
  WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
  ORDER BY kcu.table_name, kcu.column_name;
`;

const ROW_COUNT_LIMIT = 10_000_000; // Skip tables over 10M rows in normal mode
const ORPHAN_SAMPLE_LIMIT = 100;

@Injectable()
export class FkOrphanCheckService {
  private readonly logger = new Logger(FkOrphanCheckService.name);

  constructor(private readonly prisma: PrismaService) {}

  async run(targetDb?: string, deep = false): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];
    const timeout = deep ? 600_000 : 60_000;
    const start = Date.now();

    const dbs = targetDb
      ? DBS.filter((d) => d.label.toLowerCase().includes(targetDb.toLowerCase()))
      : DBS;

    for (const db of dbs) {
      if (Date.now() - start > timeout) {
        findings.push({
          severity: 'warn',
          check: 'fkOrphan',
          db: db.label,
          rule: 'timeout',
          message: `FK orphan check timed out after ${timeout / 1000}s. Partial results reported.`,
        });
        break;
      }

      try {
        const client = this.getClient(db.client);
        const fks: FkConstraint[] = await client.$queryRawUnsafe(FK_QUERY);

        for (const fk of fks) {
          if (Date.now() - start > timeout) break;

          // Skip deprecated tables
          if (fk.childTable.startsWith('_deprecated_') || fk.parentTable.startsWith('_deprecated_')) continue;

          // Skip large tables in normal mode
          if (!deep) {
            try {
              const countResult: any[] = await client.$queryRawUnsafe(
                `SELECT COUNT(*) AS cnt FROM "${fk.childTable}"`,
              );
              const rowCount = Number(countResult[0]?.cnt ?? 0);
              if (rowCount > ROW_COUNT_LIMIT) {
                this.logger.debug(`Skipping ${fk.childTable} (${rowCount} rows) — use --deep to include`);
                continue;
              }
            } catch {
              continue; // Table might not exist
            }
          }

          try {
            const orphanQuery = `
              SELECT child."${fk.childColumn}" AS fk_value, COUNT(*) AS orphan_count
              FROM "${fk.childTable}" child
              LEFT JOIN "${fk.parentTable}" parent ON child."${fk.childColumn}" = parent."${fk.parentColumn}"
              WHERE child."${fk.childColumn}" IS NOT NULL AND parent."${fk.parentColumn}" IS NULL
              GROUP BY child."${fk.childColumn}"
              LIMIT ${ORPHAN_SAMPLE_LIMIT}
            `;

            const orphans: any[] = await client.$queryRawUnsafe(orphanQuery);

            if (orphans.length > 0) {
              const totalOrphans = orphans.reduce((sum, o) => sum + Number(o.orphan_count), 0);
              findings.push({
                severity: 'error',
                check: 'fkOrphan',
                db: db.label,
                table: fk.childTable,
                model: fk.constraintName,
                rule: 'fk-orphan',
                message: `${totalOrphans} orphan row(s) in '${fk.childTable}.${fk.childColumn}' → '${fk.parentTable}.${fk.parentColumn}' (${orphans.length} distinct FK values, capped at ${ORPHAN_SAMPLE_LIMIT})`,
              });
            }
          } catch (error) {
            this.logger.debug(`FK check failed for ${fk.constraintName}: ${(error as Error).message}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to enumerate FKs for ${db.label}`, error);
      }
    }

    return findings;
  }

  private getClient(name: 'identity' | 'platform' | 'globalWorking') {
    switch (name) {
      case 'identity': return this.prisma.identity;
      case 'platform': return this.prisma.platform;
      case 'globalWorking': return this.prisma.globalWorking;
    }
  }
}
