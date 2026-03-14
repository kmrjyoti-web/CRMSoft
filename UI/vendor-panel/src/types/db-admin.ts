export interface TenantDb {
  tenantId: string;
  tenantName: string;
  dbStrategy: 'GLOBAL' | 'INDEPENDENT';
  sizeMb: number;
  lastBackupAt?: string;
  migrationsApplied: number;
  migrationsPending: number;
  status: 'HEALTHY' | 'NEEDS_REPAIR' | 'MIGRATING';
}

export interface DbFilters {
  status?: TenantDb['status'];
  dbStrategy?: TenantDb['dbStrategy'];
  search?: string;
  page?: number;
  limit?: number;
}
