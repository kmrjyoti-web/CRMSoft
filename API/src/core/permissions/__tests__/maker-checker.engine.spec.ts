import { MakerCheckerEngine } from '../engines/maker-checker.engine';
import { PermissionContext } from '../types/permission-context';

describe('MakerCheckerEngine', () => {
  let engine: MakerCheckerEngine;
  let prisma: any;

  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r1', roleName: 'SALES_EXEC', roleLevel: 4,
    action: 'quotations:approve', resourceType: 'quotation', resourceId: 'q-1',
    attributes: { amount: 60000 }, ...overrides,
  });

  const rule = {
    id: 'rule-1', entityType: 'quotation', action: 'quotations:approve',
    checkerRole: 'MANAGER', skipForRoles: ['ADMIN', 'SUPER_ADMIN'],
    amountField: 'amount', amountThreshold: 50000, expiryHours: 48, isActive: true,
  };

  beforeEach(() => {
    prisma = {
      approvalRule: { findFirst: jest.fn().mockResolvedValue(null) },
      approvalRequest: {
        create: jest.fn().mockResolvedValue({ id: 'ar-1' }),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockImplementation((args) => ({ id: args.where.id, ...args.data })),
      },
    };
    engine = new MakerCheckerEngine(prisma);
  });

  it('should return { required: false } when no rule', async () => {
    const result = await engine.requiresApproval(ctx());
    expect(result.required).toBe(false);
  });

  it('should require approval when rule matches and threshold exceeded', async () => {
    prisma.approvalRule.findFirst.mockResolvedValue(rule);
    const result = await engine.requiresApproval(ctx());
    expect(result.required).toBe(true);
    expect(result.checkerRole).toBe('MANAGER');
  });

  it('should skip for role in skipForRoles', async () => {
    prisma.approvalRule.findFirst.mockResolvedValue(rule);
    const result = await engine.requiresApproval(ctx({ roleName: 'ADMIN' }));
    expect(result.required).toBe(false);
  });

  it('should skip when amount below threshold', async () => {
    prisma.approvalRule.findFirst.mockResolvedValue(rule);
    const result = await engine.requiresApproval(ctx({ attributes: { amount: 30000 } }));
    expect(result.required).toBe(false);
  });

  it('should block self-approval', async () => {
    prisma.approvalRequest.findUnique.mockResolvedValue({
      id: 'ar-1', status: 'PENDING', makerId: 'u1',
      expiresAt: new Date(Date.now() + 86400000),
    });
    await expect(engine.approve('ar-1', 'u1')).rejects.toThrow('Self-approval');
  });

  it('should reject expired requests on approve', async () => {
    prisma.approvalRequest.findUnique.mockResolvedValue({
      id: 'ar-1', status: 'PENDING', makerId: 'u2',
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(engine.approve('ar-1', 'u1')).rejects.toThrow('expired');
  });

  it('should skip when rule is inactive (findFirst returns null)', async () => {
    // findFirst only queries isActive: true, so inactive rules are not found
    const result = await engine.requiresApproval(ctx());
    expect(result.required).toBe(false);
  });
});
