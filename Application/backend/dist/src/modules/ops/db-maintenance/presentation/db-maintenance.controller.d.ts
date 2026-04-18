import { ApiResponse } from '../../../../common/utils/api-response';
import { DbMaintenanceService } from '../db-maintenance.service';
export declare class DbMaintenanceController {
    private readonly maintenance;
    constructor(maintenance: DbMaintenanceService);
    summary(): Promise<ApiResponse<{
        databases: Array<{
            name: string;
            size: string;
            connections: number;
        }>;
        totalSize: string;
        pgVersion: string;
    }>>;
    tableStats(dbUrl?: string): Promise<ApiResponse<import("../db-maintenance.service").TableStat[]>>;
    indexStats(dbUrl?: string): Promise<ApiResponse<{
        unused: import("../db-maintenance.service").IndexStat[];
        duplicate: string[];
        total: number;
    }>>;
    bloatAnalysis(dbUrl?: string): Promise<ApiResponse<{
        tables: any[];
        indexes: any[];
    }>>;
    slowQueries(limit?: string, dbUrl?: string): Promise<ApiResponse<import("../db-maintenance.service").SlowQuery[]>>;
    connections(dbUrl?: string): Promise<ApiResponse<import("../db-maintenance.service").ConnectionPool>>;
    vacuum(body: {
        tableName?: string;
        full?: boolean;
        dbUrl?: string;
    }): Promise<ApiResponse<import("../db-maintenance.service").MaintenanceResult>>;
    analyze(body: {
        tableName?: string;
        dbUrl?: string;
    }): Promise<ApiResponse<import("../db-maintenance.service").MaintenanceResult>>;
    reindex(body: {
        indexName: string;
        dbUrl?: string;
    }): Promise<ApiResponse<import("../db-maintenance.service").MaintenanceResult>>;
    cleanupDevLogs(): Promise<ApiResponse<import("../db-maintenance.service").CleanupResult>>;
    cleanupErrorLogs(): Promise<ApiResponse<import("../db-maintenance.service").CleanupResult>>;
    cleanupAuditLogs(): Promise<ApiResponse<import("../db-maintenance.service").CleanupResult>>;
    cleanupAll(): Promise<ApiResponse<import("../db-maintenance.service").CleanupResult[]>>;
}
