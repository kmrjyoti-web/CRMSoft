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
var DbMaintenanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbMaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
let DbMaintenanceService = DbMaintenanceService_1 = class DbMaintenanceService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(DbMaintenanceService_1.name);
    }
    async getIndexStats(dbUrl) {
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const unused = await client.query(`
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
            const dup = await client.query(`
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
            const total = await client.query(`SELECT count(*) FROM pg_stat_user_indexes`);
            return {
                unused: unused.rows,
                duplicate: dup.rows.map((r) => r.duplicate_indexes),
                total: Number(total.rows[0]?.count || 0),
            };
        }
        finally {
            await client.end();
        }
    }
    async getTableStats(dbUrl) {
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const result = await client.query(`
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
        }
        finally {
            await client.end();
        }
    }
    async getBloatAnalysis(dbUrl) {
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const tables = await client.query(`
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
            const indexes = await client.query(`
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
        }
        finally {
            await client.end();
        }
    }
    async getSlowQueries(dbUrl, limit = 20) {
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const check = await client.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
      `);
            if (check.rowCount === 0) {
                return [];
            }
            const result = await client.query(`
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
        }
        finally {
            await client.end();
        }
    }
    async getConnectionPool(dbUrl) {
        const client = await this.connectRaw(dbUrl || this.config.get('PLATFORM_DATABASE_URL'));
        try {
            const active = await client.query(`
        SELECT state, count(*) AS cnt
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);
            const max = await client.query(`SHOW max_connections`);
            const counts = { active: 0, idle: 0, waiting: 0, total: 0 };
            for (const row of active.rows) {
                const c = Number(row.cnt);
                counts.total += c;
                if (row.state === 'active')
                    counts.active += c;
                else if (row.state === 'idle')
                    counts.idle += c;
                else if (row.state === 'idle in transaction')
                    counts.waiting += c;
            }
            const maxConn = Number(max.rows[0]?.max_connections || 100);
            return {
                ...counts,
                maxConnections: maxConn,
                utilizationPercent: Math.round((counts.total / maxConn) * 100),
            };
        }
        finally {
            await client.end();
        }
    }
    async runVacuum(tableName, full = false, dbUrl) {
        const start = Date.now();
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const target = tableName ? this.sanitizeIdentifier(tableName) : '';
            const sql = full
                ? `VACUUM FULL ANALYZE ${target}`
                : `VACUUM ANALYZE ${target}`;
            await client.query(sql);
            const duration = Date.now() - start;
            this.logger.log(`VACUUM${full ? ' FULL' : ''} completed on ${target || 'all tables'} in ${duration}ms`);
            return { operation: full ? 'VACUUM FULL' : 'VACUUM', target: target || 'all', duration, success: true, message: 'Completed successfully' };
        }
        catch (err) {
            return { operation: 'VACUUM', target: tableName || 'all', duration: Date.now() - start, success: false, message: err.message };
        }
        finally {
            await client.end();
        }
    }
    async runAnalyze(tableName, dbUrl) {
        const start = Date.now();
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const target = tableName ? this.sanitizeIdentifier(tableName) : '';
            await client.query(`ANALYZE ${target}`);
            const duration = Date.now() - start;
            return { operation: 'ANALYZE', target: target || 'all', duration, success: true, message: 'Completed successfully' };
        }
        catch (err) {
            return { operation: 'ANALYZE', target: tableName || 'all', duration: Date.now() - start, success: false, message: err.message };
        }
        finally {
            await client.end();
        }
    }
    async runReindex(indexName, dbUrl) {
        const start = Date.now();
        const client = await this.connectRaw(dbUrl || this.config.get('WORKING_DATABASE_URL'));
        try {
            const safe = this.sanitizeIdentifier(indexName);
            await client.query(`REINDEX INDEX CONCURRENTLY ${safe}`);
            const duration = Date.now() - start;
            return { operation: 'REINDEX', target: safe, duration, success: true, message: 'Completed successfully' };
        }
        catch (err) {
            return { operation: 'REINDEX', target: indexName, duration: Date.now() - start, success: false, message: err.message };
        }
        finally {
            await client.end();
        }
    }
    async cleanupDevLogs() {
        const start = Date.now();
        const cutoff = new Date(Date.now() - 7 * 86400_000);
        const result = await this.prisma.platform.errorLog.deleteMany({
            where: { level: 'DEBUG', createdAt: { lt: cutoff } },
        });
        return { type: 'dev_logs_7d', deleted: result.count, duration: Date.now() - start };
    }
    async cleanupErrorLogs() {
        const start = Date.now();
        const cutoff = new Date(Date.now() - 30 * 86400_000);
        const result = await this.prisma.platform.errorLog.deleteMany({
            where: { level: { in: ['INFO', 'WARN'] }, createdAt: { lt: cutoff } },
        });
        return { type: 'error_logs_30d', deleted: result.count, duration: Date.now() - start };
    }
    async cleanupAuditLogs() {
        const start = Date.now();
        const cutoff = new Date(Date.now() - 90 * 86400_000);
        const result = await this.prisma.identity.auditLog.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });
        return { type: 'audit_logs_90d', deleted: result.count, duration: Date.now() - start };
    }
    async cleanupExpiredSessions() {
        const start = Date.now();
        const cutoff = new Date(Date.now() - 7 * 86400_000);
        const result = await this.prisma.identity.session.deleteMany({
            where: { expiresAt: { lt: cutoff } },
        });
        return { type: 'sessions_7d', deleted: result.count, duration: Date.now() - start };
    }
    async runAllCleanup() {
        const results = await Promise.allSettled([
            this.cleanupDevLogs(),
            this.cleanupErrorLogs(),
            this.cleanupAuditLogs(),
            this.cleanupExpiredSessions(),
        ]);
        return results.map((r) => (r.status === 'fulfilled' ? r.value : { type: 'unknown', deleted: 0, duration: 0 }));
    }
    async getDatabaseSummary() {
        const client = await this.connectRaw(this.config.get('PLATFORM_DATABASE_URL'));
        try {
            const dbs = await client.query(`
        SELECT
          datname                                         AS name,
          pg_size_pretty(pg_database_size(datname))       AS size,
          numbackends                                     AS connections
        FROM pg_stat_database
        WHERE datname NOT IN ('template0', 'template1', 'postgres')
        ORDER BY pg_database_size(datname) DESC
      `);
            const total = await client.query(`
        SELECT pg_size_pretty(sum(pg_database_size(datname))) AS total
        FROM pg_database
      `);
            const ver = await client.query(`SELECT version()`);
            return {
                databases: dbs.rows,
                totalSize: total.rows[0]?.total || '0 bytes',
                pgVersion: (ver.rows[0]?.version || '').split(' ').slice(0, 2).join(' '),
            };
        }
        finally {
            await client.end();
        }
    }
    async connectRaw(url) {
        const client = new pg_1.Client({ connectionString: url });
        await client.connect();
        return client;
    }
    sanitizeIdentifier(name) {
        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            throw new Error(`Invalid identifier: ${name}`);
        }
        return `"${name}"`;
    }
};
exports.DbMaintenanceService = DbMaintenanceService;
exports.DbMaintenanceService = DbMaintenanceService = DbMaintenanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], DbMaintenanceService);
//# sourceMappingURL=db-maintenance.service.js.map