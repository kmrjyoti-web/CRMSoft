import { DbMaintenanceService } from './db-maintenance.service';
export declare class DbMaintenanceCron {
    private readonly maintenance;
    private readonly logger;
    constructor(maintenance: DbMaintenanceService);
    nightlyMaintenance(): Promise<void>;
    weeklyDeepVacuum(): Promise<void>;
    monthlyAuditCleanup(): Promise<void>;
    private statusOf;
    private countOf;
}
