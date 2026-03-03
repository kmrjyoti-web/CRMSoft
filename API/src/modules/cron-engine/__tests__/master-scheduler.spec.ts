import { MasterSchedulerService } from '../services/master-scheduler.service';
import * as cron from 'node-cron';

jest.mock('node-cron', () => ({
  validate: jest.fn().mockReturnValue(true),
  schedule: jest.fn().mockReturnValue({ stop: jest.fn() }),
}));

const mockPrisma = {
  cronJobConfig: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
} as any;

const mockRunner = {
  run: jest.fn().mockResolvedValue({ id: 'log-1', status: 'SUCCESS' }),
} as any;

const mockParser = {
  getNextRun: jest.fn().mockReturnValue(new Date(Date.now() + 3600000)),
} as any;

function makeService() {
  return new MasterSchedulerService(mockPrisma, mockRunner, mockParser);
}

describe('MasterSchedulerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register ACTIVE jobs on init', async () => {
    mockPrisma.cronJobConfig.findMany.mockResolvedValue([
      { jobCode: 'JOB_A', status: 'ACTIVE', cronExpression: '*/5 * * * *', timezone: 'Asia/Kolkata' },
      { jobCode: 'JOB_B', status: 'PAUSED', cronExpression: '0 * * * *', timezone: 'Asia/Kolkata' },
      { jobCode: 'JOB_C', status: 'ACTIVE', cronExpression: '0 0 * * *', timezone: 'Asia/Kolkata' },
    ]);
    mockPrisma.cronJobConfig.update.mockResolvedValue({});

    const service = makeService();
    await service.onModuleInit();

    // Should schedule 2 active jobs, skip 1 paused
    expect(cron.schedule).toHaveBeenCalledTimes(2);
  });

  it('should skip jobs with invalid cron expressions', async () => {
    (cron.validate as jest.Mock).mockReturnValueOnce(false);
    mockPrisma.cronJobConfig.findMany.mockResolvedValue([
      { jobCode: 'BAD_CRON', status: 'ACTIVE', cronExpression: 'invalid', timezone: 'UTC' },
    ]);

    const service = makeService();
    await service.onModuleInit();

    expect(cron.schedule).not.toHaveBeenCalled();
  });

  it('should stop all tasks on destroy', async () => {
    const stopFn = jest.fn();
    (cron.schedule as jest.Mock).mockReturnValue({ stop: stopFn });
    mockPrisma.cronJobConfig.findMany.mockResolvedValue([
      { jobCode: 'JOB_A', status: 'ACTIVE', cronExpression: '*/5 * * * *', timezone: 'UTC' },
    ]);
    mockPrisma.cronJobConfig.update.mockResolvedValue({});

    const service = makeService();
    await service.onModuleInit();
    service.onModuleDestroy();

    expect(stopFn).toHaveBeenCalled();
  });

  it('should force-run a job via runner', async () => {
    const service = makeService();
    await service.forceRun('TEST_JOB', 'ADMIN');

    expect(mockRunner.run).toHaveBeenCalledWith('TEST_JOB', 'ADMIN');
  });

  it('should cancel and re-register a job', async () => {
    const stopFn = jest.fn();
    (cron.schedule as jest.Mock).mockReturnValue({ stop: stopFn });
    (cron.validate as jest.Mock).mockReturnValue(true);

    mockPrisma.cronJobConfig.findMany.mockResolvedValue([
      { jobCode: 'JOB_A', status: 'ACTIVE', cronExpression: '*/5 * * * *', timezone: 'UTC' },
    ]);
    mockPrisma.cronJobConfig.findUnique.mockResolvedValue({
      jobCode: 'JOB_A',
      status: 'ACTIVE',
      cronExpression: '*/10 * * * *',
      timezone: 'UTC',
    });
    mockPrisma.cronJobConfig.update.mockResolvedValue({});

    const service = makeService();
    await service.onModuleInit();
    await service.registerJob('JOB_A');

    // Stop should have been called (cancel old), then schedule called again
    expect(stopFn).toHaveBeenCalled();
    expect(cron.schedule).toHaveBeenCalledTimes(2);
  });
});
