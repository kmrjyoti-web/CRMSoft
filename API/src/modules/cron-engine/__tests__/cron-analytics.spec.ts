import { CronAnalyticsService } from '../services/cron-analytics.service';

const mockPrisma = {
  cronJobConfig: {
    findMany: jest.fn(),
  },
  cronJobRunLog: {
    findMany: jest.fn(),
  },
} as any;

function makeService() {
  return new CronAnalyticsService(mockPrisma);
}

describe('CronAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dashboard overview with correct counts', async () => {
    const now = new Date();
    mockPrisma.cronJobConfig.findMany.mockResolvedValue([
      { jobCode: 'A', status: 'ACTIVE', isRunning: false, consecutiveFailures: 0, nextRunAt: new Date(now.getTime() + 60000) },
      { jobCode: 'B', status: 'ACTIVE', isRunning: true, consecutiveFailures: 2, lastRunAt: new Date(), nextRunAt: new Date(now.getTime() + 120000), lastRunError: 'timeout' },
      { jobCode: 'C', status: 'PAUSED', isRunning: false, consecutiveFailures: 0, nextRunAt: null },
    ]);
    mockPrisma.cronJobRunLog.findMany.mockResolvedValue([
      { status: 'SUCCESS', createdAt: now },
      { status: 'FAILED', createdAt: now },
      { status: 'SUCCESS', createdAt: now },
    ]);

    const service = makeService();
    const dashboard = await service.getDashboard();

    expect(dashboard.overview.totalJobs).toBe(3);
    expect(dashboard.overview.activeJobs).toBe(2);
    expect(dashboard.overview.pausedJobs).toBe(1);
    expect(dashboard.overview.currentlyRunning).toBe(1);
    expect(dashboard.overview.failedLast24h).toBe(1);
    expect(dashboard.overview.successRate24h).toBeCloseTo(66.67, 0);
  });

  it('should return health data for active jobs', async () => {
    const healthData = [
      { jobCode: 'A', jobName: 'Job A', successRate: 99, avgDurationMs: 120, lastRunStatus: 'SUCCESS', lastRunAt: new Date(), consecutiveFailures: 0, totalRunCount: 100, totalFailCount: 1 },
    ];
    mockPrisma.cronJobConfig.findMany.mockResolvedValue(healthData);

    const service = makeService();
    const result = await service.getHealth();

    expect(result).toHaveLength(1);
    expect(result[0].jobCode).toBe('A');
    expect(result[0].successRate).toBe(99);
  });
});
