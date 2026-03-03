import { PermissionChainService } from '../services/permission-chain.service';
import { PermissionContext } from '../types/permission-context';
import { PermissionError } from '../types/permission-error';

describe('PermissionChainService', () => {
  let service: PermissionChainService;
  let rbac: any;
  let ubac: any;
  let roleH: any;
  let deptH: any;
  let ownership: any;
  let makerChecker: any;

  const ctx = (overrides = {}): PermissionContext => ({
    userId: 'u1', roleId: 'r1', roleName: 'SALES_EXEC', roleLevel: 4,
    action: 'leads:update', resourceType: 'lead', resourceId: 'lead-1',
    ...overrides,
  });

  beforeEach(() => {
    ubac = {
      hasExplicitDeny: jest.fn().mockResolvedValue(false),
      hasExplicitGrant: jest.fn().mockResolvedValue(false),
      invalidateAll: jest.fn(),
    };
    rbac = { check: jest.fn().mockResolvedValue(true), invalidateAll: jest.fn() };
    roleH = { check: jest.fn().mockResolvedValue(true), invalidateAll: jest.fn(), getEffectivePermissions: jest.fn() };
    deptH = { check: jest.fn().mockResolvedValue(true) };
    ownership = { check: jest.fn().mockResolvedValue(true) };
    makerChecker = { requiresApproval: jest.fn().mockResolvedValue({ required: false }) };

    service = new PermissionChainService(rbac, ubac, roleH, deptH, ownership, makerChecker);
  });

  it('should ALLOW when full chain passes', async () => {
    const result = await service.can(ctx());
    expect(result.allowed).toBe(true);
  });

  it('should DENY immediately on UBAC deny', async () => {
    ubac.hasExplicitDeny.mockResolvedValue(true);
    const result = await service.can(ctx());
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('UBAC_DENIED');
    expect(rbac.check).not.toHaveBeenCalled();
  });

  it('should DENY when RBAC fails and UBAC grant does not rescue', async () => {
    rbac.check.mockResolvedValue(false);
    const result = await service.can(ctx());
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('RBAC_DENIED');
    expect(ubac.hasExplicitGrant).toHaveBeenCalled();
  });

  it('should ALLOW when RBAC fails but UBAC grant rescues', async () => {
    rbac.check.mockResolvedValue(false);
    ubac.hasExplicitGrant.mockResolvedValue(true);
    const result = await service.can(ctx());
    expect(result.allowed).toBe(true);
  });

  it('should DENY when dept hierarchy fails', async () => {
    deptH.check.mockResolvedValue(false);
    const result = await service.can(ctx());
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('DEPT_HIERARCHY_DENIED');
  });

  it('should DENY when ownership fails', async () => {
    ownership.check.mockResolvedValue(false);
    const result = await service.can(ctx());
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('OWNERSHIP_DENIED');
  });

  it('should attach maker-checker info when approval required', async () => {
    makerChecker.requiresApproval.mockResolvedValue({ required: true, checkerRole: 'MANAGER' });
    const result = await service.can(ctx());
    expect(result.allowed).toBe(true);
    expect(result.makerChecker?.requiresApproval).toBe(true);
    expect(result.makerChecker?.checkerRole).toBe('MANAGER');
  });

  it('canOrThrow should throw PermissionError on deny', async () => {
    rbac.check.mockResolvedValue(false);
    await expect(service.canOrThrow(ctx())).rejects.toThrow(PermissionError);
  });

  it('canAll should return false if any context fails', async () => {
    rbac.check.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    makerChecker.requiresApproval.mockResolvedValue({ required: false });
    const result = await service.canAll([ctx(), ctx({ action: 'leads:delete' })]);
    expect(result).toBe(false);
  });

  it('canAny should return true if at least one passes', async () => {
    rbac.check.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    makerChecker.requiresApproval.mockResolvedValue({ required: false });
    const result = await service.canAny([ctx({ action: 'leads:delete' }), ctx()]);
    expect(result).toBe(true);
  });
});
