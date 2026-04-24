import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Client as PgClient } from 'pg';

export interface IndexStat {
  schemaName: string;
  tableName: string;
  indexName: string;
  indexSize: string;
  indexScans: number;
  isUnique: boolean;
  isUnused: boolean;
}

export interface TableStat {
  tableName: string;
  rowCount: number;
  totalSize: string;
  tableSize: string;
  indexSize: string;
  bloatPercent: number;
  lastVacuum: Date | null;
  lastAnalyze: Date | null;
  seqScans: number;
  indexScans: number;
}

export interface SlowQuery {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  stddevTime: number;
  rows: number;
}

export interface ConnectionPool {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  maxConnections: number;
  utilizationPercent: number;
}

export interface MaintenanceResult {
  operation: string;
  target: string;
  duration: number;
  success: boolean;
  message: string;
}

export interface CleanupResult {
  type: string;
  deleted: number;
  duration: number;
}

@Injectable()
export class DbMaintenanceService {
  private readonly logger = new Logger(DbMaintenanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ─── Index Analysis ──────────────────────────────────────────────────────────

  async getIndexStats(dbUrl?: string): Promise<{ unused: IndexStat[]; duplicate: string[]; total: number }> {
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      const unused = await client.query<any>(`
        SELECT
          schemaname        AS "schemaName",
          tablename         AS "tableName",
          indexname         AS "indexName",
          pg_size_pretty(pg_relation_size(indexrelid)) AS "indexSize",
          idx_scan          AS "indexScans",
          indisunique       AS "isUnique",
          idx_scan = 0      AS "isUnused"
        FROM pg_stat_user_indexes
        JOIN pg_index USING (indexrelid)
        WHERE idx_scan < 50
          AND NOT indisprimary
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 100
      `);

      const dup = await client.query<any>(`
        SELECT string_agg(indexname, ', ') AS duplicate_indexes
        FROM (
          SELECT tablename, array_agg(indexname ORDER BY indexname) AS indexes,
                 count(*) AS cnt
          FROM pg_indexes
          WHERE schemaname = 'public'
          GROUP BY tablename, indexdef
          HAVING count(*) > 1
        ) t
        GROUP BY tablename
        HAVING count(*) > 0
      `);

      const total = await client.query<any>(`SELECT count(*) FROM pg_stat_user_indexes`);

      return {
        unused: unused.rows as IndexStat[],
        duplicate: dup.rows.map((r: any) => r.duplicate_indexes),
        total: Number(total.rows[0]?.count || 0),
      };
    } finally {
      await client.end();
    }
  }

  // ─── Table Stats ─────────────────────────────────────────────────────────────

  async getTableStats(dbUrl?: string): Promise<TableStat[]> {
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      const result = await client.query<any>(`
        SELECT
          relname                                               AS "tableName",
          n_live_tup                                           AS "rowCount",
          pg_size_pretty(pg_total_relation_size(oid))          AS "totalSize",
          pg_size_pretty(pg_relation_size(oid))                AS "tableSize",
          pg_size_pretty(pg_indexes_size(oid))                 AS "indexSize",
          CASE WHEN pg_relation_size(oid) > 0
            THEN ROUND(100.0 * (pg_total_relation_size(oid) - pg_relation_size(oid) - pg_indexes_size(oid)) / pg_total_relation_size(oid), 1)
            ELSE 0 END                                         AS "bloatPercent",
          last_vacuum                                          AS "lastVacuum",
          last_analyze                                         AS "lastAnalyze",
          seq_scan                                             AS "seqScans",
          idx_scan                                             AS "indexScans"
        FROM pg_stat_user_tables
        JOIN pg_class ON relname = pg_stat_user_tables.relname AND relkind = 'r'
        ORDER BY pg_total_relation_size(oid) DESC
        LIMIT 50
      `);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  // ─── Bloat Analysis ──────────────────────────────────────────────────────────

  async getBloatAnalysis(dbUrl?: string): Promise<{ tables: any[]; indexes: any[] }> {
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      const tables = await client.query<any>(`
        SELECT
          relname                                           AS "tableName",
          n_dead_tup                                       AS "deadTuples",
          n_live_tup                                       AS "liveTuples",
          CASE WHEN n_live_tup > 0
            THEN ROUND(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 1)
            ELSE 0 END                                     AS "bloatPercent",
          pg_size_pretty(pg_relation_size(oid))            AS "tableSize",
          last_vacuum                                      AS "lastVacuum",
          last_autovacuum                                  AS "lastAutovacuum"
        FROM pg_stat_user_tables
        JOIN pg_class ON relname = pg_stat_user_tables.relname AND relkind = 'r'
        WHERE n_dead_tup > 1000
        ORDER BY n_dead_tup DESC
        LIMIT 20
      `);

      const indexes = await client.query<any>(`
        SELECT
          indexrelname                                          AS "indexName",
          tablename                                            AS "tableName",
          pg_size_pretty(pg_relation_size(indexrelid))        AS "indexSize",
          idx_scan                                             AS "indexScans",
          idx_tup_read                                         AS "tuplesRead",
          idx_tup_fetch                                        AS "tuplesFetched"
        FROM pg_stat_user_indexes
        JOIN pg_indexes ON indexrelname = indexname
        WHERE idx_scan < 10
          AND pg_relation_size(indexrelid) > 1048576
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 20
      `);

      return { tables: tables.rows, indexes: indexes.rows };
    } finally {
      await client.end();
    }
  }

  // ─── Slow Queries ────────────────────────────────────────────────────────────

  async getSlowQueries(dbUrl?: string, limit = 20): Promise<SlowQuery[]> {
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      // pg_stat_statements must be enabled
      const check = await client.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
      `);
      if (check.rowCount === 0) {
        return [];
      }

      const result = await client.query<any>(`
        SELECT
          query,
          calls,
          ROUND(total_exec_time::numeric, 2)  AS "totalTime",
          ROUND(mean_exec_time::numeric, 2)   AS "meanTime",
          ROUND(stddev_exec_time::numeric, 2) AS "stddevTime",
          rows
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat%'
          AND calls > 5
        ORDER BY mean_exec_time DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  // ─── Connection Pool ─────────────────────────────────────────────────────────

  async getConnectionPool(dbUrl?: string): Promise<ConnectionPool> {
    const client = await this.connectRaw(dbUrl || this.config.get<string>('PLATFORM_DATABASE_URL')!);
    try {
      const active = await client.query<any>(`
        SELECT state, count(*) AS cnt
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);
      const max = await client.query<any>(`SHOW max_connections`);

      const counts = { active: 0, idle: 0, waiting: 0, total: 0 };
      for (const row of active.rows) {
        const c = Number(row.cnt);
        counts.total += c;
        if (row.state === 'active') counts.active += c;
        else if (row.state === 'idle') counts.idle += c;
        else if (row.state === 'idle in transaction') counts.waiting += c;
      }
      const maxConn = Number(max.rows[0]?.max_connections || 100);

      return {
        ...counts,
        maxConnections: maxConn,
        utilizationPercent: Math.round((counts.total / maxConn) * 100),
      };
    } finally {
      await client.end();
    }
  }

  // ─── Maintenance Operations ───────────────────────────────────────────────────

  async runVacuum(tableName?: string, full = false, dbUrl?: string): Promise<MaintenanceResult> {
    const start = Date.now();
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      const target = tableName ? this.sanitizeIdentifier(tableName) : '';
      const sql = full
        ? `VACUUM FULL ANALYZE ${target}`
        : `VACUUM ANALYZE ${target}`;
      await client.query(sql);
      const duration = Date.now() - start;
      this.logger.log(`VACUUM${full ? ' FULL' : ''} completed on ${target || 'all tables'} in ${duration}ms`);
      return { operation: full ? 'VACUUM FULL' : 'VACUUM', target: target || 'all', duration, success: true, message: 'Completed successfully' };
    } catch (err: any) {
      return { operation: 'VACUUM', target: tableName || 'all', duration: Date.now() - start, success: false, message: err.message };
    } finally {
      await client.end();
    }
  }

  async runAnalyze(tableName?: string, dbUrl?: string): Promise<MaintenanceResult> {
    const start = Date.now();
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      const target = tableName ? this.sanitizeIdentifier(tableName) : '';
      await client.query(`ANALYZE ${target}`);
      const duration = Date.now() - start;
      return { operation: 'ANALYZE', target: target || 'all', duration, success: true, message: 'Completed successfully' };
    } catch (err: any) {
      return { operation: 'ANALYZE', target: tableName || 'all', duration: Date.now() - start, success: false, message: err.message };
    } finally {
      await client.end();
    }
  }

  async runReindex(indexName: string, dbUrl?: string): Promise<MaintenanceResult> {
    const start = Date.now();
    const client = await this.connectRaw(dbUrl || this.config.get<string>('WORKING_DATABASE_URL')!);
    try {
      const safe = this.sanitizeIdentifier(indexName);
      await client.query(`REINDEX INDEX CONCURRENTLY ${safe}`);
      const duration = Date.now() - start;
      return { operation: 'REINDEX', target: safe, duration, success: true, message: 'Completed successfully' };
    } catch (err: any) {
      return { operation: 'REINDEX', target: indexName, duration: Date.now() - start, success: false, message: err.message };
    } finally {
      await client.end();
    }
  }

  // ─── Log Cleanup ─────────────────────────────────────────────────────────────

  async cleanupDevLogs(): Promise<CleanupResult> {
    const start = Date.now();
    const cutoff = new Date(Date.now() - 7 * 86400_000);
    const result = await this.prisma.platform.errorLog.deleteMany({
      where: { level: 'DEBUG', createdAt: { lt: cutoff } } as any,
    });
    return { type: 'dev_logs_7d', deleted: result.count, duration: Date.now() - start };
  }

  async cleanupErrorLogs(): Promise<CleanupResult> {
    const start = Date.now();
    const cutoff = new Date(Date.now() - 30 * 86400_000);
    const result = await this.prisma.platform.errorLog.deleteMany({
      where: { level: { in: ['INFO', 'WARN'] }, createdAt: { lt: cutoff } } as any,
    });
    return { type: 'error_logs_30d', deleted: result.count, duration: Date.now() - start };
  }

  async cleanupAuditLogs(): Promise<CleanupResult> {
    const start = Date.now();
    const cutoff = new Date(Date.now() - 90 * 86400_000);
    const result = await this.prisma.identity.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return { type: 'audit_logs_90d', deleted: result.count, duration: Date.now() - start };
  }

  async cleanupExpiredSessions(): Promise<CleanupResult> {
    const start = Date.now();
    const cutoff = new Date(Date.now() - 7 * 86400_000);
    const result = await (this.prisma.identity as any).session.deleteMany({
      where: { expiresAt: { lt: cutoff } },
    });
    return { type: 'sessions_7d', deleted: result.count, duration: Date.now() - start };
  }

  async runAllCleanup(): Promise<CleanupResult[]> {
    const results = await Promise.allSettled([
      this.cleanupDevLogs(),
      this.cleanupErrorLogs(),
      this.cleanupAuditLogs(),
      this.cleanupExpiredSessions(),
    ]);
    return results.map((r) => (r.status === 'fulfilled' ? r.value : { type: 'unknown', deleted: 0, duration: 0 }));
  }

  // ─── DB Health Summary ────────────────────────────────────────────────────────

  async getDatabaseSummary(): Promise<{
    databases: Array<{ name: string; size: string; connections: number }>;
    totalSize: string;
    pgVersion: string;
  }> {
    const client = await this.connectRaw(this.config.get<string>('PLATFORM_DATABASE_URL')!);
    try {
      const dbs = await client.query<any>(`
        SELECT
          datname                                         AS name,
          pg_size_pretty(pg_database_size(datname))       AS size,
          numbackends                                     AS connections
        FROM pg_stat_database
        WHERE datname NOT IN ('template0', 'template1', 'postgres')
        ORDER BY pg_database_size(datname) DESC
      `);
      const total = await client.query<any>(`
        SELECT pg_size_pretty(sum(pg_database_size(datname))) AS total
        FROM pg_database
      `);
      const ver = await client.query<any>(`SELECT version()`);
      return {
        databases: dbs.rows,
        totalSize: total.rows[0]?.total || '0 bytes',
        pgVersion: (ver.rows[0]?.version || '').split(' ').slice(0, 2).join(' '),
      };
    } finally {
      await client.end();
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async connectRaw(url: string): Promise<PgClient> {
    const client = new PgClient({ connectionString: url });
    await client.connect();
    return client;
  }

  private sanitizeIdentifier(name: string): string {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      throw new Error(`Invalid identifier: ${name}`);
    }
    return `"${name}"`;
  }
}
