import { UbacEngine } from '../engines/ubac.engine';
import { PermissionContext } from '../types/permission-context';

describe('UbacEngine', () => {
  let engine: UbacEngine;
  let prisma: any;
  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r1', roleName: 'SALES_EXEC', roleLevel: 4, action: 'leads:delete', ...overrides,
  });

  beforeEach(() => {
    prisma = { userPermissionOverride: { findMany: jest.fn().mockResolvedValue([]) } };
    engine = new UbacEngine(prisma);
  });

  it('should return true for explicit deny', async () => {
    prisma.userPermissionOverride.findMany.mockResolvedValue([
      { action: 'leads:delete', effect: 'deny' },
    ]);
    expect(await engine.hasExplicitDeny(ctx())).toBe(true);
  });

  it('should return true for explicit grant', async () => {
    prisma.userPermissionOverride.findMany.mockResolvedValue([
      { action: 'leads:delete', effect: 'grant' },
    ]);
    expect(await engine.hasExplicitGrant(ctx())).toBe(true);
  });

  it('should ignore expired overrides (query filter)', async () => {
    await engine.hasExplicitDeny(ctx());
    expect(prisma.userPermissionOverride.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
      }),
    });
  });

  it('should support wildcard deny "leads:*"', async () => {
    prisma.userPermissionOverride.findMany.mockResolvedValue([
      { action: 'leads:*', effect: 'deny' },
    ]);
    expect(await engine.hasExplicitDeny(ctx())).toBe(true);
  });

  it('should return false when no override exists', async () => {
    expect(await engine.hasExplicitDeny(ctx())).toBe(false);
    expect(await engine.hasExplicitGrant(ctx())).toBe(false);
  });
});
