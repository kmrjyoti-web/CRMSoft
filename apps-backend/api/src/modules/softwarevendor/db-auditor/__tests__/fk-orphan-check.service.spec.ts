import { FkOrphanCheckService } from '../checks/fk-orphan-check.service';

const mockFk = {
  constraintName: 'lead_contact_id_fkey',
  childTable: 'lead',
  childColumn: 'contactId',
  parentTable: 'contact',
  parentColumn: 'id',
};

function makePrismaClient(fks: any[], rowCount: number, orphans: any[]) {
  return {
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce(fks)           // FK query
      .mockResolvedValueOnce([{ cnt: rowCount }]) // row count check
      .mockResolvedValueOnce(orphans),            // orphan query
  };
}

function makePrisma(identityClient?: any, platformClient?: any, workingClient?: any) {
  return {
    identity: identityClient ?? { $queryRawUnsafe: jest.fn().mockResolvedValue([]) },
    platform: platformClient ?? { $queryRawUnsafe: jest.fn().mockResolvedValue([]) },
    globalWorking: workingClient ?? { $queryRawUnsafe: jest.fn().mockResolvedValue([]) },
  };
}

describe('FkOrphanCheckService', () => {
  it('should return empty findings when no FK constraints exist', async () => {
    const prisma = makePrisma(
      { $queryRawUnsafe: jest.fn().mockResolvedValue([]) },
    );
    const service = new FkOrphanCheckService(prisma as any);
    const findings = await service.run('identity');
    expect(findings).toEqual([]);
  });

  it('should return error finding when orphan rows are detected', async () => {
    const client = makePrismaClient(
      [mockFk],
      100,
      [{ fk_value: 'c-999', orphan_count: 3 }],
    );
    const prisma = makePrisma(client);
    const service = new FkOrphanCheckService(prisma as any);
    const findings = await service.run('identity');

    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('error');
    expect(findings[0].check).toBe('fkOrphan');
    expect(findings[0].message).toContain('orphan');
    expect(findings[0].table).toBe('lead');
  });

  it('should return no findings when no orphans found', async () => {
    const client = makePrismaClient([mockFk], 100, []);
    const prisma = makePrisma(client);
    const service = new FkOrphanCheckService(prisma as any);
    const findings = await service.run('identity');
    expect(findings).toEqual([]);
  });

  it('should skip tables over ROW_COUNT_LIMIT in normal mode', async () => {
    const client = {
      $queryRawUnsafe: jest.fn()
        .mockResolvedValueOnce([mockFk])                   // FK list
        .mockResolvedValueOnce([{ cnt: 10_000_001 }]),     // row count exceeds limit
    };
    const prisma = makePrisma(client);
    const service = new FkOrphanCheckService(prisma as any);
    const findings = await service.run('identity', false);

    // Only 2 calls — FK list + row count; no orphan query
    expect(client.$queryRawUnsafe).toHaveBeenCalledTimes(2);
    expect(findings).toEqual([]);
  });

  it('should skip deprecated tables', async () => {
    const deprecatedFk = { ...mockFk, childTable: '_deprecated_lead' };
    const client = {
      $queryRawUnsafe: jest.fn().mockResolvedValueOnce([deprecatedFk]),
    };
    const prisma = makePrisma(client);
    const service = new FkOrphanCheckService(prisma as any);
    const findings = await service.run('identity');

    // Only 1 call — FK list; deprecated table is skipped entirely
    expect(client.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    expect(findings).toEqual([]);
  });

  it('should filter by targetDb label when provided', async () => {
    // 'platform' filter → should only run against PlatformDB, not IdentityDB
    const identityClient = { $queryRawUnsafe: jest.fn() };
    const platformClient = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };
    const workingClient = { $queryRawUnsafe: jest.fn() };

    const prisma = makePrisma(identityClient, platformClient, workingClient);
    const service = new FkOrphanCheckService(prisma as any);
    await service.run('platform');

    expect(platformClient.$queryRawUnsafe).toHaveBeenCalled();
    expect(identityClient.$queryRawUnsafe).not.toHaveBeenCalled();
    expect(workingClient.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('should run against all 3 DBs when no targetDb given', async () => {
    const identityClient = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };
    const platformClient = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };
    const workingClient = { $queryRawUnsafe: jest.fn().mockResolvedValue([]) };

    const prisma = makePrisma(identityClient, platformClient, workingClient);
    const service = new FkOrphanCheckService(prisma as any);
    await service.run();

    expect(identityClient.$queryRawUnsafe).toHaveBeenCalled();
    expect(platformClient.$queryRawUnsafe).toHaveBeenCalled();
    expect(workingClient.$queryRawUnsafe).toHaveBeenCalled();
  });

  it('should handle FK enumeration failure gracefully without throwing', async () => {
    const client = {
      $queryRawUnsafe: jest.fn().mockRejectedValue(new Error('DB unreachable')),
    };
    const prisma = makePrisma(client);
    const service = new FkOrphanCheckService(prisma as any);
    await expect(service.run('identity')).resolves.toEqual([]);
  });
});
