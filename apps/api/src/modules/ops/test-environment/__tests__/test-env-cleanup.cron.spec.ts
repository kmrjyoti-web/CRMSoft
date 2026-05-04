import { TestEnvCleanupCron } from '../application/jobs/test-env-cleanup.cron';
import { TEST_ENV_REPOSITORY } from '../infrastructure/repositories/test-env.repository';

const mockRepo = {
  findExpired: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  countActive: jest.fn(),
  create: jest.fn(),
  findByTenantId: jest.fn(),
};

const mockDbOps = {
  dropDatabase: jest.fn().mockResolvedValue(undefined),
};

function buildCron() {
  return new TestEnvCleanupCron(mockRepo as any, mockDbOps as any);
}

const expiredEnv1 = { id: 'env-1', name: 'test_env_1', testDbName: 'test_db_1' };
const expiredEnv2 = { id: 'env-2', name: 'test_env_2', testDbName: 'test_db_2' };

describe('TestEnvCleanupCron', () => {
  afterEach(() => jest.clearAllMocks());

  it('does nothing when no expired environments found', async () => {
    mockRepo.findExpired.mockResolvedValue([]);
    const cron = buildCron();

    await cron.cleanupExpiredEnvironments();

    expect(mockDbOps.dropDatabase).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('drops database and marks as CLEANED for each expired env', async () => {
    mockRepo.findExpired.mockResolvedValue([expiredEnv1, expiredEnv2]);
    mockRepo.update.mockResolvedValue({});

    const cron = buildCron();
    await cron.cleanupExpiredEnvironments();

    expect(mockDbOps.dropDatabase).toHaveBeenCalledTimes(2);
    expect(mockDbOps.dropDatabase).toHaveBeenCalledWith('test_db_1');
    expect(mockDbOps.dropDatabase).toHaveBeenCalledWith('test_db_2');

    // Each env gets a CLEANING then CLEANED update
    const cleanedCalls = mockRepo.update.mock.calls.filter(
      (c: any) => c[1].status === 'CLEANED',
    );
    expect(cleanedCalls).toHaveLength(2);
    cleanedCalls.forEach((call: any) => {
      expect(call[1].cleanedAt).toBeInstanceOf(Date);
    });
  });

  it('continues processing remaining envs when one fails', async () => {
    mockRepo.findExpired.mockResolvedValue([expiredEnv1, expiredEnv2]);
    mockRepo.update.mockResolvedValue({});
    mockDbOps.dropDatabase
      .mockRejectedValueOnce(new Error('DB not found'))
      .mockResolvedValueOnce(undefined);

    const cron = buildCron();
    // Should NOT throw — errors are caught per-env
    await expect(cron.cleanupExpiredEnvironments()).resolves.toBeUndefined();

    expect(mockDbOps.dropDatabase).toHaveBeenCalledTimes(2);

    // env-1 should be marked FAILED, env-2 should be CLEANED
    const failedCall = mockRepo.update.mock.calls.find(
      (c: any) => c[0] === 'env-1' && c[1].status === 'FAILED',
    );
    expect(failedCall).toBeDefined();

    const cleanedCall = mockRepo.update.mock.calls.find(
      (c: any) => c[0] === 'env-2' && c[1].status === 'CLEANED',
    );
    expect(cleanedCall).toBeDefined();
  });

  it('skips already-cleaned environments (they never appear in findExpired)', async () => {
    // findExpired only returns READY/COMPLETED/TESTING status envs
    // so CLEANED environments will never be in the result
    mockRepo.findExpired.mockResolvedValue([]);
    const cron = buildCron();

    await cron.cleanupExpiredEnvironments();
    expect(mockDbOps.dropDatabase).not.toHaveBeenCalled();
  });
});
