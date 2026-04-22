// @ts-nocheck
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateVersionHandler } from '../application/handlers/create-version.handler';
import { PublishVersionHandler } from '../application/handlers/publish-version.handler';
import { RollbackVersionHandler } from '../application/handlers/rollback-version.handler';
import { CreatePatchHandler } from '../application/handlers/create-patch.handler';
import { ListVersionsHandler } from '../application/handlers/list-versions.handler';
import { GetVersionHandler, GetCurrentVersionHandler } from '../application/handlers/get-version.handler';
import { CreateVersionCommand } from '../application/commands/create-version.command';
import { PublishVersionCommand } from '../application/commands/publish-version.command';
import { RollbackVersionCommand } from '../application/commands/rollback-version.command';
import { CreatePatchCommand } from '../application/commands/create-patch.command';
import { ListVersionsQuery } from '../application/queries/list-versions.query';
import { GetVersionQuery, GetCurrentVersionQuery } from '../application/queries/get-version.query';

const mockVersion = {
  id: 'ver-1',
  version: '2.0.0',
  releaseType: 'MAJOR',
  status: 'DRAFT',
  changelog: [],
  breakingChanges: [],
  migrationNotes: null,
  codeName: 'Phoenix',
  gitBranch: 'release/2.0.0',
  deployedAt: null,
  deployedBy: null,
};

const mockLiveVersion = { ...mockVersion, id: 'ver-live', version: '1.9.0', status: 'LIVE' };

// ── CreateVersionHandler ──────────────────────────────────────────────────────

describe('CreateVersionHandler', () => {
  let prisma: any;
  let handler: CreateVersionHandler;

  beforeEach(() => {
    prisma = {
      platform: {
        appVersion: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockVersion),
        },
      },
    };
    handler = new CreateVersionHandler(prisma as any);
  });

  it('creates a DRAFT version successfully', async () => {
    const cmd = new CreateVersionCommand('2.0.0', 'MAJOR', [], [], undefined, 'Phoenix', 'release/2.0.0', 'user-1');
    const result = await handler.execute(cmd);
    expect(prisma.platform.appVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DRAFT', version: '2.0.0' }) }),
    );
    expect(result.version).toBe('2.0.0');
  });

  it('throws ConflictException if version already exists', async () => {
    prisma.platform.appVersion.findUnique.mockResolvedValue(mockVersion);
    const cmd = new CreateVersionCommand('2.0.0', 'MAJOR', [], [], undefined, undefined, undefined, 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });
});

// ── PublishVersionHandler ─────────────────────────────────────────────────────

describe('PublishVersionHandler', () => {
  let prisma: any;
  let handler: PublishVersionHandler;

  beforeEach(() => {
    prisma = {
      platform: {
        appVersion: {
          findUnique: jest.fn().mockResolvedValue(mockVersion),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue({ ...mockVersion, status: 'LIVE' }),
        },
      },
      identity: {
        versionBackup: {
          create: jest.fn().mockResolvedValue({ id: 'backup-1' }),
        },
      },
    };
    handler = new PublishVersionHandler(prisma as any);
  });

  it('publishes version: creates backup, deprecates LIVE, sets new LIVE', async () => {
    const cmd = new PublishVersionCommand('ver-1', 'user-1', 'v2.0.0', 'abc123');
    const result = await handler.execute(cmd);
    expect(prisma.identity.versionBackup.create).toHaveBeenCalledTimes(1);
    expect(prisma.platform.appVersion.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'LIVE' }, data: { status: 'DEPRECATED' } }),
    );
    expect(result.status).toBe('LIVE');
  });

  it('throws NotFoundException when version does not exist', async () => {
    prisma.platform.appVersion.findUnique.mockResolvedValue(null);
    const cmd = new PublishVersionCommand('bad-id', 'user-1', undefined, undefined);
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException if version is already LIVE', async () => {
    prisma.platform.appVersion.findUnique.mockResolvedValue(mockLiveVersion);
    const cmd = new PublishVersionCommand('ver-live', 'user-1', undefined, undefined);
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });
});

// ── GetVersionHandler ─────────────────────────────────────────────────────────

describe('GetVersionHandler', () => {
  let prisma: any;
  let handler: GetVersionHandler;

  beforeEach(() => {
    prisma = {
      platform: {
        appVersion: {
          findUnique: jest.fn().mockResolvedValue({ ...mockVersion, patches: [] }),
        },
      },
    };
    handler = new GetVersionHandler(prisma as any);
  });

  it('returns version with patches', async () => {
    const result = await handler.execute(new GetVersionQuery('ver-1'));
    expect(result.id).toBe('ver-1');
    expect(result.patches).toBeDefined();
  });

  it('throws NotFoundException for unknown id', async () => {
    prisma.platform.appVersion.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetVersionQuery('bad-id'))).rejects.toThrow(NotFoundException);
  });
});

// ── GetCurrentVersionHandler ──────────────────────────────────────────────────

describe('GetCurrentVersionHandler', () => {
  let prisma: any;
  let handler: GetCurrentVersionHandler;

  beforeEach(() => {
    prisma = {
      platform: {
        appVersion: {
          findFirst: jest.fn().mockResolvedValue(mockLiveVersion),
        },
      },
    };
    handler = new GetCurrentVersionHandler(prisma as any);
  });

  it('returns the LIVE version', async () => {
    const result = await handler.execute(new GetCurrentVersionQuery());
    expect(result.status).toBe('LIVE');
  });

  it('returns fallback object when no LIVE version exists', async () => {
    prisma.platform.appVersion.findFirst.mockResolvedValue(null);
    const result = await handler.execute(new GetCurrentVersionQuery());
    expect(result.status).toBe('NO_LIVE_VERSION');
  });
});

// ── ListVersionsHandler ───────────────────────────────────────────────────────

describe('ListVersionsHandler', () => {
  let prisma: any;
  let handler: ListVersionsHandler;

  beforeEach(() => {
    prisma = {
      platform: {
        appVersion: {
          findMany: jest.fn().mockResolvedValue([mockVersion]),
          count: jest.fn().mockResolvedValue(1),
        },
      },
    };
    handler = new ListVersionsHandler(prisma as any);
  });

  it('returns paginated list of versions', async () => {
    const result = await handler.execute(new ListVersionsQuery(1, 20, undefined, undefined));
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });
});
