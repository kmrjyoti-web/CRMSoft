import { ReportSchedulerService } from '../infrastructure/report-scheduler.service';

describe('ReportSchedulerService', () => {
  let scheduler: ReportSchedulerService;
  const mockPrisma = {
    scheduledReport: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    reportExportLog: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  } as any;
  const mockEngine = {
    export: jest.fn().mockResolvedValue({ fileUrl: '/tmp/test.xlsx', fileName: 'test.xlsx' }),
  } as any;
  const mockEmailer = {
    sendReport: jest.fn().mockResolvedValue(undefined),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    scheduler = new ReportSchedulerService(mockPrisma, mockEngine, mockEmailer);
  });

  it('calculateNextScheduledAt returns next day for DAILY', () => {
    const next = scheduler.calculateNextScheduledAt('DAILY', null, null, '09:00');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(next.getDate()).toBe(tomorrow.getDate());
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
  });

  it('calculateNextScheduledAt returns correct day for WEEKLY', () => {
    const next = scheduler.calculateNextScheduledAt('WEEKLY', 1, null, '10:00'); // Monday
    expect(next.getDay()).toBe(1); // Monday
    expect(next.getHours()).toBe(10);
  });

  it('calculateNextScheduledAt returns next month for MONTHLY', () => {
    const now = new Date();
    const next = scheduler.calculateNextScheduledAt('MONTHLY', null, 15, '08:00');
    expect(next.getMonth()).toBe((now.getMonth() + 1) % 12);
    expect(next.getDate()).toBe(15);
  });

  it('processScheduledReports does nothing when no reports are due', async () => {
    mockPrisma.scheduledReport.findMany.mockResolvedValue([]);
    await scheduler.processScheduledReports();
    expect(mockEngine.export).not.toHaveBeenCalled();
    expect(mockEmailer.sendReport).not.toHaveBeenCalled();
  });
});
