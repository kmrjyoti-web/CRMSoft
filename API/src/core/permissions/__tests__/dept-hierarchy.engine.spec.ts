import { DeptHierarchyEngine } from '../engines/dept-hierarchy.engine';
import { PermissionContext } from '../types/permission-context';

describe('DeptHierarchyEngine', () => {
  let engine: DeptHierarchyEngine;
  let prisma: any;

  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r1', roleName: 'SALES_EXEC', roleLevel: 4,
    action: 'leads:read', departmentPath: '/COMPANY/SALES', ...overrides,
  });

  beforeEach(() => {
    prisma = { department: { findUnique: jest.fn().mockResolvedValue(null) } };
    engine = new DeptHierarchyEngine(prisma);
  });

  it('should ALLOW child department access', () => {
    expect(engine.canAccess('/COMPANY/SALES', '/COMPANY/SALES/NORTH')).toBe(true);
  });

  it('should ALLOW parent to see children', () => {
    expect(engine.canAccess('/COMPANY', '/COMPANY/SALES/NORTH')).toBe(true);
  });

  it('should DENY sibling department access', () => {
    expect(engine.canAccess('/COMPANY/SALES', '/COMPANY/SUPPORT')).toBe(false);
  });

  it('should ALLOW ADMIN (level 1) to bypass dept check', async () => {
    expect(await engine.check(ctx({ roleLevel: 1 }))).toBe(true);
  });

  it('should skip check when no department in context', async () => {
    expect(await engine.check(ctx({ departmentPath: undefined, departmentId: undefined }))).toBe(true);
  });
});
