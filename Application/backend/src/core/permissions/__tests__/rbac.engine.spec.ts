import { RbacEngine } from '../engines/rbac.engine';
import { PermissionContext } from '../types/permission-context';

describe('RbacEngine', () => {
  let engine: RbacEngine;
  let prisma: any;
  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r1', roleName: 'SALES_EXEC', roleLevel: 4, action: 'leads:create', ...overrides,
  });

  beforeEach(() => {
    prisma = {
      rolePermission: {
        findMany: jest.fn().mockResolvedValue([
          { permission: { module: 'leads', action: 'create' } },
          { permission: { module: 'leads', action: 'read' } },
          { permission: { module: 'contacts', action: 'read' } },
        ]),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    engine = new RbacEngine(prisma);
  });

  it('should match wildcard "*" to any action', () => {
    expect(engine.matchesPermission('leads:create', '*')).toBe(true);
    expect(engine.matchesPermission('anything:here', '*')).toBe(true);
  });

  it('should match module wildcard "leads:*"', () => {
    expect(engine.matchesPermission('leads:create', 'leads:*')).toBe(true);
    expect(engine.matchesPermission('leads:delete', 'leads:*')).toBe(true);
    expect(engine.matchesPermission('contacts:read', 'leads:*')).toBe(false);
  });

  it('should match exact permission', () => {
    expect(engine.matchesPermission('leads:create', 'leads:create')).toBe(true);
    expect(engine.matchesPermission('leads:delete', 'leads:create')).toBe(false);
  });

  it('should ALLOW SUPER_ADMIN (level 0) without DB check', async () => {
    const result = await engine.check(ctx({ roleLevel: 0 }));
    expect(result).toBe(true);
    expect(prisma.rolePermission.findMany).not.toHaveBeenCalled();
  });

  it('should DENY when role lacks permission', async () => {
    const result = await engine.check(ctx({ action: 'leads:delete' }));
    expect(result).toBe(false);
  });

  it('should cache role permissions (5-min TTL)', async () => {
    await engine.check(ctx());
    await engine.check(ctx());
    expect(prisma.rolePermission.findMany).toHaveBeenCalledTimes(1);
  });
});
