import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
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
export declare class DbMaintenanceService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    getIndexStats(dbUrl?: string): Promise<{
        unused: IndexStat[];
        duplicate: string[];
        total: number;
    }>;
    getTableStats(dbUrl?: string): Promise<TableStat[]>;
    getBloatAnalysis(dbUrl?: string): Promise<{
        tables: any[];
        indexes: any[];
    }>;
    getSlowQueries(dbUrl?: string, limit?: number): Promise<SlowQuery[]>;
    getConnectionPool(dbUrl?: string): Promise<ConnectionPool>;
    runVacuum(tableName?: string, full?: boolean, dbUrl?: string): Promise<MaintenanceResult>;
    runAnalyze(tableName?: string, dbUrl?: string): Promise<MaintenanceResult>;
    runReindex(indexName: string, dbUrl?: string): Promise<MaintenanceResult>;
    cleanupDevLogs(): Promise<CleanupResult>;
    cleanupErrorLogs(): Promise<CleanupResult>;
    cleanupAuditLogs(): Promise<CleanupResult>;
    cleanupExpiredSessions(): Promise<CleanupResult>;
    runAllCleanup(): Promise<CleanupResult[]>;
    getDatabaseSummary(): Promise<{
        databases: Array<{
            name: string;
            size: string;
            connections: number;
        }>;
        totalSize: string;
        pgVersion: string;
    }>;
    private connectRaw;
    private sanitizeIdentifier;
}
