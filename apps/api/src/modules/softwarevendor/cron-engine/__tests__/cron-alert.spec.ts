import { CronAlertService } from '../services/cron-alert.service';

const mockPrisma = {
  notification: {
    createMany: jest.fn().mockResolvedValue({ count: 2 }),
  },
} as any;
(mockPrisma as any).working = mockPrisma;

function makeService() {
  return new CronAlertService(mockPrisma);
}

const fakeJob = {
  id: 'job-1',
  jobCode: 'TEST_JOB',
  jobName: 'Test Job',
  moduleName: 'test',
  alertChannel: 'BOTH',
  alertRecipientEmails: ['admin@test.com'],
  alertRecipientUserIds: ['user-1', 'user-2'],
  consecutiveFailures: 3,
  lastRunAt: new Date(),
} as any;

const fakeRunLog = {
  id: 'log-1',
  startedAt: new Date(),
  triggeredBy: 'SCHEDULER',
} as any;

describe('CronAlertService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create in-app notifications for each recipient', async () => {
    const service = makeService();
    await service.sendAlert(fakeJob, 'Connection timeout', fakeRunLog);

    expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          recipientId: 'user-1',
          title: expect.stringContaining('CRON Job Failed'),
        }),
        expect.objectContaining({
          recipientId: 'user-2',
        }),
      ]),
    });
  });

  it('should skip in-app alert when no userIds configured', async () => {
    const service = makeService();
    const jobNoUsers = { ...fakeJob, alertRecipientUserIds: [], alertChannel: 'IN_APP' };

    await service.sendAlert(jobNoUsers, 'Error', fakeRunLog);
    expect(mockPrisma.notification.createMany).not.toHaveBeenCalled();
  });

  it('should handle EMAIL-only channel without creating notifications', async () => {
    const service = makeService();
    const jobEmailOnly = { ...fakeJob, alertChannel: 'EMAIL' };

    await service.sendAlert(jobEmailOnly, 'Error', fakeRunLog);
    expect(mockPrisma.notification.createMany).not.toHaveBeenCalled();
  });
});
