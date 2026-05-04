import { NotFoundException } from '@nestjs/common';
import { CleanupTestEnvHandler } from '../application/commands/cleanup-test-env/cleanup-test-env.handler';
import { CleanupTestEnvCommand } from '../application/commands/cleanup-test-env/cleanup-test-env.command';
import { TEST_ENV_REPOSITORY } from '../infrastructure/repositories/test-env.repository';

const mockRepo = {
  findById: jest.fn(),
  update: jest.fn(),
  countActive: jest.fn(),
  create: jest.fn(),
  findByTenantId: jest.fn(),
  findExpired: jest.fn(),
};

const mockDbOps = {
  dropDatabase: jest.fn().mockResolvedValue(undefined),
  buildTestDbUrl: jest.fn(),
};

function buildHandler() {
  return new CleanupTestEnvHandler(mockRepo as any, mockDbOps as any);
}

describe('CleanupTestEnvHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws NotFoundException when test env does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const handler = buildHandler();

    await expect(
      handler.execute(new CleanupTestEnvCommand('missing-id', 'user-1')),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(mockDbOps.dropDatabase).not.toHaveBeenCalled();
  });

  it('returns cleaned=true and is idempotent when already CLEANED', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'env-1', status: 'CLEANED', testDbName: 'test_db' });
    const handler = buildHandler();

    const result = await handler.execute(new CleanupTestEnvCommand('env-1', 'user-1'));

    expect(result).toEqual({ cleaned: true });
    expect(mockDbOps.dropDatabase).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('drops DB and updates status to CLEANED on success', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'env-1', status: 'READY', testDbName: 'sharma_ent_20260325_143022' });
    mockRepo.update.mockResolvedValue({});
    const handler = buildHandler();

    const result = await handler.execute(new CleanupTestEnvCommand('env-1', 'user-1'));

    expect(result).toEqual({ cleaned: true });
    expect(mockDbOps.dropDatabase).toHaveBeenCalledWith('sharma_ent_20260325_143022');

    // Should first set CLEANING, then CLEANED
    expect(mockRepo.update).toHaveBeenNthCalledWith(
      1,
      'env-1',
      expect.objectContaining({ status: 'CLEANING' }),
    );
    expect(mockRepo.update).toHaveBeenNthCalledWith(
      2,
      'env-1',
      expect.objectContaining({ status: 'CLEANED', cleanedAt: expect.any(Date) }),
    );
  });

  it('updates status to FAILED and rethrows if dropDatabase fails', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'env-1', status: 'READY', testDbName: 'test_db' });
    mockDbOps.dropDatabase.mockRejectedValue(new Error('pg connection refused'));

    const handler = buildHandler();
    await expect(
      handler.execute(new CleanupTestEnvCommand('env-1', 'user-1')),
    ).rejects.toThrow('pg connection refused');

    expect(mockRepo.update).toHaveBeenCalledWith(
      'env-1',
      expect.objectContaining({ status: 'FAILED' }),
    );
  });
});
