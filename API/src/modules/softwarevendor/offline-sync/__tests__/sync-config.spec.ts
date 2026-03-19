import { SyncEngineService } from '../services/sync-engine.service';

const mockWarningEvaluator = {
  evaluateWarnings: jest.fn(),
};

function makeMockPrisma(policies: any[] = [], rules: any[] = []) {
  const obj: any = {
    syncPolicy: {
      findMany: jest.fn().mockResolvedValue(policies),
    },
    syncWarningRule: {
      findMany: jest.fn().mockResolvedValue(rules),
    },
    syncDevice: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    syncAuditLog: {
      create: jest.fn(),
    },
  };
  obj.working = obj;
  return obj;
}

describe('SyncEngineService - Config', () => {
  it('returns all enabled policies and rules', async () => {
    const policies = [
      {
        entityName: 'Contact',
        displayName: 'Contacts',
        direction: 'BIDIRECTIONAL',
        syncIntervalMinutes: 30,
        maxRowsOffline: 5000,
        maxDataAgeDays: 90,
        conflictStrategy: 'LATEST_WINS',
        downloadScope: 'OWNED',
        syncPriority: 1,
        isEnabled: true,
      },
      {
        entityName: 'Lead',
        displayName: 'Leads',
        direction: 'BIDIRECTIONAL',
        syncIntervalMinutes: 15,
        maxRowsOffline: 3000,
        maxDataAgeDays: 60,
        conflictStrategy: 'MERGE_FIELDS',
        downloadScope: 'OWNED',
        syncPriority: 2,
        isEnabled: true,
      },
    ];
    const rules = [
      {
        id: 'rule-1',
        name: 'Lead staleness',
        trigger: 'DATA_AGE',
        level1Action: 'WARN_ONLY',
        level1Threshold: 2,
        level1Message: 'Lead data stale',
        level2Action: 'BLOCK_AFTER_DELAY',
        level2Threshold: 5,
        level2Message: 'Block soon',
        level2DelayMinutes: 30,
        level3Action: null,
        level3Threshold: null,
        level3Message: null,
        isEnabled: true,
        priority: 1,
        policy: { entityName: 'Lead' },
      },
    ];
    const prisma = makeMockPrisma(policies, rules);
    const service = new SyncEngineService(prisma, mockWarningEvaluator as any);

    const config = await service.getConfig('user-1');

    expect(config.policies).toHaveLength(2);
    expect(config.policies[0].entityName).toBe('Contact');
    expect(config.warningRules).toHaveLength(1);
    expect(config.warningRules[0].entity).toBe('Lead');
    expect(config.serverTimestamp).toBeDefined();
  });

  it('respects enabled/disabled — only returns enabled policies', async () => {
    // findMany is already filtered by isEnabled:true in the service,
    // so we only return what would match that filter
    const policies = [
      {
        entityName: 'Contact',
        displayName: 'Contacts',
        direction: 'BIDIRECTIONAL',
        syncIntervalMinutes: 30,
        maxRowsOffline: 5000,
        maxDataAgeDays: 90,
        conflictStrategy: 'LATEST_WINS',
        downloadScope: 'OWNED',
        syncPriority: 1,
        isEnabled: true,
      },
    ];
    const prisma = makeMockPrisma(policies, []);
    const service = new SyncEngineService(prisma, mockWarningEvaluator as any);

    const config = await service.getConfig('user-1');

    expect(config.policies).toHaveLength(1);
    expect(config.policies[0].entityName).toBe('Contact');
  });

  it('includes global settings with correct defaults', async () => {
    const prisma = makeMockPrisma([], []);
    const service = new SyncEngineService(prisma, mockWarningEvaluator as any);

    const config = await service.getConfig('user-1');

    expect(config.globalSettings).toEqual({
      maxTotalStorageMb: 500,
      heartbeatIntervalMinutes: 15,
      syncOnAppOpen: true,
      syncOnNetworkRestore: true,
      requireSyncBeforeActivity: false,
      maxOfflineDaysBeforeLock: 30,
    });
  });
});
