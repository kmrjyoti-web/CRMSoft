import { BadRequestException } from '@nestjs/common';
import { CreateTestEnvHandler, TEST_ENV_QUEUE } from '../application/commands/create-test-env/create-test-env.handler';
import { CreateTestEnvCommand } from '../application/commands/create-test-env/create-test-env.command';
import { TEST_ENV_REPOSITORY } from '../infrastructure/repositories/test-env.repository';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockRepo = {
  countActive: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByTenantId: jest.fn(),
  update: jest.fn(),
  findExpired: jest.fn(),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-1' }),
};

const mockPrisma = {
  identity: {
    tenant: {
      findUnique: jest.fn().mockResolvedValue({ slug: 'sharma_ent', name: 'Sharma Enterprises' }),
    },
  },
  platform: {
    testEnvironment: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
};

function buildHandler() {
  const handler = new CreateTestEnvHandler(
    mockRepo as any,
    mockQueue as any,
    mockPrisma as any,
  );
  return handler;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CreateTestEnvHandler', () => {
  afterEach(() => jest.clearAllMocks());

  describe('execute — validation', () => {
    it('throws BadRequestException when tenant has 3+ active envs', async () => {
      mockRepo.countActive.mockResolvedValue(3);
      const handler = buildHandler();

      await expect(
        handler.execute(
          new CreateTestEnvCommand('tenant-1', 'user-1', 'SEED_DATA'),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for BACKUP_RESTORE without backupId', async () => {
      mockRepo.countActive.mockResolvedValue(0);
      const handler = buildHandler();

      await expect(
        handler.execute(
          new CreateTestEnvCommand('tenant-1', 'user-1', 'BACKUP_RESTORE'),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('execute — success path', () => {
    beforeEach(() => {
      mockRepo.countActive.mockResolvedValue(0);
      mockRepo.create.mockImplementation(async (data: any) => ({
        id: 'env-uuid-123',
        ...data,
      }));
    });

    it('creates a TestEnvironment record and queues a BullMQ job', async () => {
      const handler = buildHandler();
      const result = await handler.execute(
        new CreateTestEnvCommand('tenant-1', 'user-1', 'SEED_DATA'),
      );

      expect(result.id).toBe('env-uuid-123');
      expect(result.name).toMatch(/^sharma_ent_\d{8}_\d{6}$/);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          createdById: 'user-1',
          sourceType: 'SEED_DATA',
        }),
      );

      expect(mockQueue.add).toHaveBeenCalledWith(
        'CREATE_TEST_ENV',
        { testEnvId: 'env-uuid-123' },
        expect.any(Object),
      );
    });

    it('generates DB name in {companyCode}_{timestamp} format', async () => {
      const handler = buildHandler();
      const result = await handler.execute(
        new CreateTestEnvCommand('tenant-1', 'user-1', 'SEED_DATA'),
      );
      // Company code from mock: SHARMA_ENT → sharma_ent
      expect(result.name).toMatch(/^sharma_ent_\d{8}_\d{6}$/);
    });

    it('uses custom displayName when provided', async () => {
      const handler = buildHandler();
      await handler.execute(
        new CreateTestEnvCommand(
          'tenant-1',
          'user-1',
          'SEED_DATA',
          'My Custom Test',
        ),
      );

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'My Custom Test' }),
      );
    });

    it('auto-generates displayName when not provided', async () => {
      const handler = buildHandler();
      await handler.execute(
        new CreateTestEnvCommand('tenant-1', 'user-1', 'SEED_DATA'),
      );

      const createCall = mockRepo.create.mock.calls[0][0];
      expect(createCall.displayName).toContain('Seed Test');
    });

    it('allows LIVE_CLONE without backupId', async () => {
      const handler = buildHandler();
      const result = await handler.execute(
        new CreateTestEnvCommand('tenant-1', 'user-1', 'LIVE_CLONE'),
      );
      expect(result.id).toBeDefined();
    });

    it('allows BACKUP_RESTORE with backupId', async () => {
      const handler = buildHandler();
      const result = await handler.execute(
        new CreateTestEnvCommand(
          'tenant-1',
          'user-1',
          'BACKUP_RESTORE',
          undefined,
          'backup-abc-123',
        ),
      );
      expect(result.id).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ backupId: 'backup-abc-123' }),
      );
    });
  });
});
