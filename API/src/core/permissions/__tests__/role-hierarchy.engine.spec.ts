import { RoleHierarchyEngine } from '../engines/role-hierarchy.engine';
import { PermissionContext } from '../types/permission-context';

describe('RoleHierarchyEngine', () => {
  let engine: RoleHierarchyEngine;
  let prisma: any;

  const roles = [
    { id: 'r0', name: 'SUPER_ADMIN', level: 0, canManageLevels: [1, 2, 3, 4, 5, 6] },
    { id: 'r1', name: 'ADMIN', level: 1, canManageLevels: [2, 3, 4, 5, 6] },
    { id: 'r2', name: 'MANAGER', level: 2, canManageLevels: [3, 4, 5] },
    { id: 'r4', name: 'SALES_EXEC', level: 4, canManageLevels: [] },
    { id: 'r6', name: 'VIEWER', level: 6, canManageLevels: [] },
  ];

  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r2', roleName: 'MANAGER', roleLevel: 2, action: 'leads:update', ...overrides,
  });

  beforeEach(() => {
    prisma = {
      role: { findMany: jest.fn().mockResolvedValue(roles) },
      user: { findUnique: jest.fn() },
      permission: { findMany: jest.fn().mockResolvedValue([]) },
      rolePermission: { findMany: jest.fn().mockResolvedValue([]) },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    engine = new RoleHierarchyEngine(prisma);
  });

  it('should ALLOW inheritance — MANAGER (2) manages SALES_EXEC (4)', async () => {
    expect(await engine.check(ctx(), 4)).toBe(true);
  });

  it('should use canManageLevels override', async () => {
    expect(await engine.check(ctx(), 3)).toBe(true); // 3 is in MANAGER's canManageLevels
  });

  it('should get effective permissions with deduplication', async () => {
    prisma.user.findUnique.mockResolvedValue({ roleId: 'r2', role: { level: 2 } });
    prisma.role.findMany.mockResolvedValue([{ id: 'r2' }, { id: 'r4' }, { id: 'r6' }]);
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: { module: 'leads', action: 'read' } },
      { permission: { module: 'leads', action: 'read' } }, // duplicate
    ]);
    const perms = await engine.getEffectivePermissions('u1');
    expect(perms).toHaveLength(1);
  });

  it('should give SUPER_ADMIN all permissions', async () => {
    prisma.user.findUnique.mockResolvedValue({ roleId: 'r0', role: { level: 0 } });
    prisma.permission.findMany.mockResolvedValue([
      { module: 'leads', action: 'create' },
      { module: 'leads', action: 'delete' },
    ]);
    const perms = await engine.getEffectivePermissions('u1');
    expect(perms).toHaveLength(2);
  });

  it('should DENY VIEWER from managing anyone', async () => {
    expect(await engine.check(ctx({ roleId: 'r6', roleLevel: 6 }), 4)).toBe(false);
  });

  it('should ALLOW when disabled (no target level)', async () => {
    expect(await engine.check(ctx())).toBe(true);
  });
});
