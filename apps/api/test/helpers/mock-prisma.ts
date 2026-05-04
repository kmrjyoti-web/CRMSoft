/**
 * Standardized multi-DB Prisma mock helpers.
 *
 * Supports the 3-DB client pattern used throughout this codebase:
 *   prisma.identity   → Identity DB (users, roles, permissions, tenants)
 *   prisma.platform   → Platform DB (packages, modules, marketplace)
 *   prisma.working    → Working/Tenant DB (leads, contacts, etc.)
 *   prisma.<model>    → Direct model access (backward-compat alias for working)
 *
 * Usage:
 *   const prisma = createMockPrismaService();
 *   prisma.identity.user.findFirst.mockResolvedValue({ id: '1', name: 'Test' });
 *   prisma.platform.package.findMany.mockResolvedValue([...]);
 *   prisma.lead.findMany.mockResolvedValue([...]);
 */

type MockModel = {
  findMany: jest.Mock;
  findFirst: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
  upsert: jest.Mock;
  deleteMany: jest.Mock;
  updateMany: jest.Mock;
  aggregate: jest.Mock;
  groupBy: jest.Mock;
};

export type MockPrismaService = ReturnType<typeof createMockPrismaService>;

function createMockModel(): MockModel {
  return {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'mock-id', ...args.data }),
    ),
    update: jest.fn().mockImplementation((args: { where: { id: string }; data: Record<string, unknown> }) =>
      Promise.resolve({ id: args.where?.id ?? 'mock-id', ...args.data }),
    ),
    delete: jest.fn().mockResolvedValue({}),
    count: jest.fn().mockResolvedValue(0),
    upsert: jest.fn().mockImplementation((args: { create: Record<string, unknown> }) =>
      Promise.resolve({ id: 'mock-id', ...args.create }),
    ),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    aggregate: jest.fn().mockResolvedValue({}),
    groupBy: jest.fn().mockResolvedValue([]),
  };
}

function createDbProxy(store: Record<string, MockModel>): Record<string, MockModel> {
  return new Proxy(store, {
    get(target, model: string) {
      if (!target[model]) {
        target[model] = createMockModel();
      }
      return target[model];
    },
  });
}

/**
 * Creates a mock PrismaService with full 3-DB client support.
 * All model accesses return auto-created mock models with jest.fn() methods.
 */
export function createMockPrismaService() {
  const identityStore: Record<string, MockModel> = {};
  const platformStore: Record<string, MockModel> = {};
  const workingStore: Record<string, MockModel> = {};

  const identityProxy = createDbProxy(identityStore);
  const platformProxy = createDbProxy(platformStore);
  const workingProxy = createDbProxy(workingStore);

  // Direct model access resolves to the working DB (backward compat)
  const directProxy = new Proxy(
    {
      identity: identityProxy,
      platform: platformProxy,
      working: workingProxy,
      // Backward compat: mock.$transaction
      $transaction: jest.fn().mockImplementation((fn: unknown) => {
        if (typeof fn === 'function') return fn(directProxy);
        if (Array.isArray(fn)) return Promise.all(fn);
        return Promise.resolve();
      }),
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      // getWorkingClient returns the same working proxy
      getWorkingClient: jest.fn().mockReturnValue(workingProxy),
    } as Record<string, unknown>,
    {
      get(target, prop: string) {
        if (prop in target) return target[prop];
        // Fall through to working DB for direct model access
        return workingProxy[prop];
      },
    },
  );

  // Alias: make prisma.platform point to the same store as prisma.platform
  // and allow mock.platform = mock pattern (self-reference) used in marketplace tests
  (directProxy as Record<string, unknown>).platform = platformProxy;
  (directProxy as Record<string, unknown>).identity = identityProxy;
  (directProxy as Record<string, unknown>).working = workingProxy;

  return directProxy as typeof directProxy & {
    identity: typeof identityProxy;
    platform: typeof platformProxy;
    working: typeof workingProxy;
    $transaction: jest.Mock;
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    getWorkingClient: jest.Mock;
    [model: string]: MockModel | unknown;
  };
}

/**
 * Creates an auto-mocked repository for any interface.
 * All methods automatically become jest.fn().
 *
 * Usage:
 *   const repo = createMockRepository<ILeadRepository>();
 *   repo.findById.mockResolvedValue(leadEntity);
 */
export function createMockRepository<T>(): jest.Mocked<T> {
  return new Proxy({} as jest.Mocked<T>, {
    get(target, prop: string) {
      if (!(prop in target)) {
        (target as Record<string, jest.Mock>)[prop] = jest.fn();
      }
      return (target as Record<string, jest.Mock>)[prop];
    },
  });
}

/**
 * Resets all mocks on a given model (useful between test cases).
 */
export function resetMockModel(model: MockModel): void {
  Object.values(model).forEach((fn) => {
    if (typeof fn === 'function' && 'mockReset' in fn) {
      (fn as jest.Mock).mockReset();
    }
  });
}
