import { CreateScheduledTestHandler } from '../application/commands/create-scheduled-test/create-scheduled-test.handler';
import { CreateScheduledTestCommand } from '../application/commands/create-scheduled-test/create-scheduled-test.command';
import { SCHEDULED_TEST_REPOSITORY } from '../infrastructure/repositories/scheduled-test.repository';

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByTenantId: jest.fn(),
  findDue: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

function buildHandler() {
  return new CreateScheduledTestHandler(mockRepo as any);
}

describe('CreateScheduledTestHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('creates a scheduled test with computed nextRunAt', async () => {
    const created = {
      id: 'st-1',
      tenantId: 't-1',
      name: 'Nightly Test',
      cronExpression: '0 2 * * *',
      testTypes: ['UNIT', 'FUNCTIONAL', 'SMOKE'],
      targetModules: [],
      dbSourceType: 'BACKUP_RESTORE',
    };
    mockRepo.create.mockResolvedValue(created);

    const result = await buildHandler().execute(
      new CreateScheduledTestCommand('t-1', 'u-1', 'Nightly Test', '0 2 * * *', [], ['UNIT', 'FUNCTIONAL', 'SMOKE']),
    );

    expect(result).toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 't-1',
      name: 'Nightly Test',
      cronExpression: '0 2 * * *',
      testTypes: ['UNIT', 'FUNCTIONAL', 'SMOKE'],
      dbSourceType: 'BACKUP_RESTORE',
      createdById: 'u-1',
      nextRunAt: expect.any(Date),
    }));
  });

  it('defaults to [UNIT, FUNCTIONAL, SMOKE] when testTypes is empty', async () => {
    mockRepo.create.mockImplementation(async (data: any) => ({ id: 'st-2', ...data }));

    await buildHandler().execute(
      new CreateScheduledTestCommand('t-1', 'u-1', 'Test', '0 2 * * *', [], []),
    );

    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg.testTypes).toEqual(['UNIT', 'FUNCTIONAL', 'SMOKE']);
  });

  it('uses custom dbSourceType when provided', async () => {
    mockRepo.create.mockImplementation(async (data: any) => ({ id: 'st-3', ...data }));

    await buildHandler().execute(
      new CreateScheduledTestCommand('t-1', 'u-1', 'Test', '0 * * * *', [], ['SMOKE'], undefined, 'LIVE_CLONE'),
    );

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ dbSourceType: 'LIVE_CLONE' }),
    );
  });

  it('computes a future nextRunAt from cron expression', async () => {
    mockRepo.create.mockImplementation(async (data: any) => ({ id: 'st-4', ...data }));

    await buildHandler().execute(
      new CreateScheduledTestCommand('t-1', 'u-1', 'Test', '0 0 * * 0', [], ['UNIT']),
    );

    const arg = mockRepo.create.mock.calls[0][0];
    expect(arg.nextRunAt.getTime()).toBeGreaterThan(Date.now());
  });
});
