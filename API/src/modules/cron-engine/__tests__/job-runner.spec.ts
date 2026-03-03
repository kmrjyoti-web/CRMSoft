import { JobRunnerService } from '../services/job-runner.service';

const mockPrisma = {
  cronJobConfig: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  cronJobRunLog: {
    create: jest.fn(),
    update: jest.fn(),
  },
  tenant: {
    findMany: jest.fn().mockResolvedValue([]),
  },
} as any;

const mockRegistry = {
  getHandler: jest.fn(),
} as any;

const mockParser = {
  getNextRun: jest.fn().mockReturnValue(new Date(Date.now() + 3600000)),
} as any;

const mockAlert = {
  sendAlert: jest.fn().mockResolvedValue(undefined),
} as any;

function makeService() {
  return new JobRunnerService(mockPrisma, mockRegistry, mockParser, mockAlert);
}

const fakeJob = {
  id: 'job-1',
  jobCode: 'TEST_JOB',
  status: 'ACTIVE',
  isRunning: false,
  allowConcurrent: false,
  timeoutSeconds: 30,
  scope: 'GLOBAL',
  jobParams: {},
  maxRetries: 0,
  retryDelaySeconds: 5,
  consecutiveFailures: 0,
  alertAfterConsecutiveFailures: 3,
  alertOnFailure: true,
  alertOnTimeout: true,
  totalRunCount: 10,
  totalFailCount: 1,
  avgDurationMs: 500,
  lastRunAt: new Date(),
  cronExpression: '*/5 * * * *',
  timezone: 'Asia/Kolkata',
};

describe('JobRunnerService', () => {
  let service: JobRunnerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = makeService();
  });

  it('should return null when job not found', async () => {
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue(null);

    const result = await service.run('NON_EXISTENT', 'TEST');
    expect(result).toBeNull();
  });

  it('should skip when job is already running and concurrent not allowed', async () => {
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({
      ...fakeJob,
      isRunning: true,
    });
    mockPrisma.cronJobRunLog.create.mockResolvedValue({
      id: 'log-1',
      status: 'SKIPPED',
    });

    const result = await service.run('TEST_JOB', 'TEST');
    expect(result?.status).toBe('SKIPPED');
    expect(mockPrisma.cronJobRunLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SKIPPED' }),
      }),
    );
  });

  it('should execute job successfully and log SUCCESS', async () => {
    const handler = {
      jobCode: 'TEST_JOB',
      execute: jest.fn().mockResolvedValue({ recordsProcessed: 5 }),
    };
    mockRegistry.getHandler.mockReturnValue(handler);
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({ ...fakeJob });
    mockPrisma.cronJobConfig.update.mockResolvedValue({});
    mockPrisma.cronJobRunLog.create.mockResolvedValue({
      id: 'log-1',
      startedAt: new Date(),
    });
    mockPrisma.cronJobRunLog.update.mockResolvedValue({
      id: 'log-1',
      status: 'SUCCESS',
    });

    const result = await service.run('TEST_JOB', 'SCHEDULER');
    expect(result?.status).toBe('SUCCESS');
    expect(handler.execute).toHaveBeenCalled();
  });

  it('should handle execution failure and log FAILED', async () => {
    const handler = {
      jobCode: 'TEST_JOB',
      execute: jest.fn().mockRejectedValue(new Error('DB connection lost')),
    };
    mockRegistry.getHandler.mockReturnValue(handler);
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({ ...fakeJob });
    mockPrisma.cronJobConfig.update.mockResolvedValue({});
    mockPrisma.cronJobRunLog.create.mockResolvedValue({
      id: 'log-1',
      startedAt: new Date(),
    });
    mockPrisma.cronJobRunLog.update.mockResolvedValue({
      id: 'log-1',
      status: 'FAILED',
    });

    const result = await service.run('TEST_JOB', 'SCHEDULER');
    expect(result?.status).toBe('FAILED');
    expect(mockPrisma.cronJobRunLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'DB connection lost',
        }),
      }),
    );
  });

  it('should throw error when no handler is registered', async () => {
    mockRegistry.getHandler.mockReturnValue(null);
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({ ...fakeJob });
    mockPrisma.cronJobConfig.update.mockResolvedValue({});
    mockPrisma.cronJobRunLog.create.mockResolvedValue({
      id: 'log-1',
      startedAt: new Date(),
    });
    mockPrisma.cronJobRunLog.update.mockResolvedValue({
      id: 'log-1',
      status: 'FAILED',
    });

    const result = await service.run('TEST_JOB', 'SCHEDULER');
    expect(result?.status).toBe('FAILED');
    expect(mockPrisma.cronJobRunLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          errorMessage: expect.stringContaining('No handler registered'),
        }),
      }),
    );
  });

  it('should release lock (isRunning=false) even after failure', async () => {
    const handler = {
      jobCode: 'TEST_JOB',
      execute: jest.fn().mockRejectedValue(new Error('crash')),
    };
    mockRegistry.getHandler.mockReturnValue(handler);
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({ ...fakeJob });
    mockPrisma.cronJobConfig.update.mockResolvedValue({});
    mockPrisma.cronJobRunLog.create.mockResolvedValue({
      id: 'log-1',
      startedAt: new Date(),
    });
    mockPrisma.cronJobRunLog.update.mockResolvedValue({ id: 'log-1', status: 'FAILED' });

    await service.run('TEST_JOB', 'SCHEDULER');

    // The finally block should release the lock
    const updateCalls = mockPrisma.cronJobConfig.update.mock.calls;
    const lockRelease = updateCalls.find(
      (call: any) => call[0]?.data?.isRunning === false,
    );
    expect(lockRelease).toBeDefined();
  });
});
