import { OwnershipEngine } from '../engines/ownership.engine';
import { PermissionContext } from '../types/permission-context';

describe('OwnershipEngine', () => {
  let engine: OwnershipEngine;
  let prisma: any;

  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r1', roleName: 'SALES_EXEC', roleLevel: 4,
    action: 'leads:update', resourceType: 'lead', resourceId: 'lead-1', ...overrides,
  });

  beforeEach(() => {
    prisma = {
      entityOwner: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    engine = new OwnershipEngine(prisma);
  });

  it('should ALLOW when user is owner with sufficient relationship', async () => {
    prisma.entityOwner.findFirst.mockResolvedValue({ id: 'eo-1', ownerType: 'PRIMARY_OWNER' });
    expect(await engine.check(ctx())).toBe(true);
  });

  it('should DENY read-only watcher from updating', async () => {
    // findFirst returns null because watcher isn't in the allowed ownerTypes for 'update'
    expect(await engine.check(ctx())).toBe(false);
  });

  it('should ALLOW watcher for read action', async () => {
    prisma.entityOwner.findFirst.mockResolvedValue({ id: 'eo-1', ownerType: 'WATCHER' });
    expect(await engine.check(ctx({ action: 'leads:read' }))).toBe(true);
  });

  it('should DENY when no ownership relationship', async () => {
    expect(await engine.check(ctx())).toBe(false);
  });

  it('should ALLOW ADMIN (level 1) to bypass ownership', async () => {
    expect(await engine.check(ctx({ roleLevel: 1 }))).toBe(true);
  });
});
