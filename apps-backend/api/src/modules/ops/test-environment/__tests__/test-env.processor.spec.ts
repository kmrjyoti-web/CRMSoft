import { TestEnvProcessor } from '../application/jobs/test-env.processor';
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
  buildTestDbUrl: jest.fn().mockReturnValue('postgresql://u:p@host:5432/test_db'),
  createDatabase: jest.fn().mockResolvedValue(undefined),
  runAllMigrations: jest.fn().mockResolvedValue(4),
  runSeedScripts: jest.fn().mockResolvedValue(250),
  getDatabaseSize: jest.fn().mockResolvedValue(8388608), // 8 MB
  cloneDatabase: jest.fn().mockResolvedValue(undefined),
  restoreFromBackup: jest.fn().mockResolvedValue(undefined),
};

function buildProcessor() {
  return new TestEnvProcessor(mockDbOps as any, mockRepo as any);
}

const baseEnv = {
  id: 'env-uuid',
  name: 'sharma_ent_20260325_143022',
  testDbName: 'sharma_ent_20260325_143022',
  ttlHours: 24,
  sourceType: 'SEED_DATA',
  sourceDbUrl: null,
  backupId: null,
};

describe('TestEnvProcessor', () => {
  afterEach(() => jest.clearAllMocks());

  describe('SEED_DATA flow', () => {
    it('creates DB → runs migrations → seeds → marks READY', async () => {
      mockRepo.findById.mockResolvedValue({ ...baseEnv, sourceType: 'SEED_DATA' });
      mockRepo.update.mockResolvedValue({});

      const processor = buildProcessor();
      await processor.handleCreate({ data: { testEnvId: 'env-uuid' } } as any);

      // Correct DB creation order
      expect(mockDbOps.createDatabase).toHaveBeenCalledWith('sharma_ent_20260325_143022');
      expect(mockDbOps.runAllMigrations).toHaveBeenCalledWith('postgresql://u:p@host:5432/test_db');
      expect(mockDbOps.runSeedScripts).toHaveBeenCalledWith('postgresql://u:p@host:5432/test_db');
      expect(mockDbOps.getDatabaseSize).toHaveBeenCalledWith('sharma_ent_20260325_143022');

      // Final update to READY
      const lastUpdate = mockRepo.update.mock.calls.find((c: any) => c[1].status === 'READY');
      expect(lastUpdate).toBeDefined();
      expect(lastUpdate[1]).toMatchObject({
        status: 'READY',
        progressPercent: 100,
        dbSizeBytes: BigInt(8388608),
      });
    });

    it('records tablesCreated and seedRecords on the env', async () => {
      mockRepo.findById.mockResolvedValue({ ...baseEnv, sourceType: 'SEED_DATA' });
      mockRepo.update.mockResolvedValue({});

      const processor = buildProcessor();
      await processor.handleCreate({ data: { testEnvId: 'env-uuid' } } as any);

      // An intermediate update should include tablesCreated=4, seedRecords=250
      const seedUpdate = mockRepo.update.mock.calls.find(
        (c: any) => c[1].tablesCreated !== undefined,
      );
      expect(seedUpdate).toBeDefined();
      expect(seedUpdate[1].tablesCreated).toBe(4);
      expect(seedUpdate[1].seedRecords).toBe(250);
    });
  });

  describe('LIVE_CLONE flow', () => {
    it('calls cloneDatabase with sourceUrl', async () => {
      mockRepo.findById.mockResolvedValue({
        ...baseEnv,
        sourceType: 'LIVE_CLONE',
        sourceDbUrl: 'postgresql://u:p@prod-host:5432/production',
      });
      mockRepo.update.mockResolvedValue({});

      const processor = buildProcessor();
      await processor.handleCreate({ data: { testEnvId: 'env-uuid' } } as any);

      expect(mockDbOps.cloneDatabase).toHaveBeenCalledWith(
        'postgresql://u:p@prod-host:5432/production',
        'sharma_ent_20260325_143022',
      );
      expect(mockDbOps.createDatabase).not.toHaveBeenCalled();
    });

    it('throws when sourceDbUrl is missing for LIVE_CLONE', async () => {
      mockRepo.findById.mockResolvedValue({
        ...baseEnv,
        sourceType: 'LIVE_CLONE',
        sourceDbUrl: '',
      });
      mockRepo.update.mockResolvedValue({});

      const processor = buildProcessor();
      await expect(
        processor.handleCreate({ data: { testEnvId: 'env-uuid' } } as any),
      ).rejects.toThrow('sourceDbUrl is required');

      // Should mark as FAILED
      const failedUpdate = mockRepo.update.mock.calls.find((c: any) => c[1].status === 'FAILED');
      expect(failedUpdate).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('marks env as FAILED and rethrows when an error occurs', async () => {
      mockRepo.findById.mockResolvedValue({ ...baseEnv, sourceType: 'SEED_DATA' });
      mockDbOps.createDatabase.mockRejectedValue(new Error('disk full'));
      mockRepo.update.mockResolvedValue({});

      const processor = buildProcessor();
      await expect(
        processor.handleCreate({ data: { testEnvId: 'env-uuid' } } as any),
      ).rejects.toThrow('disk full');

      const failedUpdate = mockRepo.update.mock.calls.find((c: any) => c[1].status === 'FAILED');
      expect(failedUpdate).toBeDefined();
      expect(failedUpdate[1].errorMessage).toBe('disk full');
    });

    it('throws when testEnv is not found in DB', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const processor = buildProcessor();

      await expect(
        processor.handleCreate({ data: { testEnvId: 'missing-id' } } as any),
      ).rejects.toThrow('TestEnvironment not found');
    });
  });
});
