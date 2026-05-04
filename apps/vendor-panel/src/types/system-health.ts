export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN';

export interface SystemHealth {
  api: {
    status: ServiceStatus;
    uptime: number;
    responseTimeMs: number;
    requestsPerMin: number;
  };
  database: {
    status: ServiceStatus;
    connectionPool: number;
    queryTimeMs: number;
  };
  redis: {
    status: ServiceStatus;
    memoryUsedMb: number;
    connectedClients: number;
  };
  queue: {
    status: ServiceStatus;
    pending: number;
    active: number;
    failed: number;
    completed: number;
  };
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}
