import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MenuPermissionGuard } from '../../../../core/permissions/guards/menu-permission.guard';
import { MenuPermissionService } from '../../application/services/menu-permission.service';

describe('MenuPermissionGuard', () => {
  let guard: MenuPermissionGuard;
  let reflector: Reflector;
  const mockService = {
    hasPermission: jest.fn(),
    hasAnyPermission: jest.fn(),
    hasAllPermissions: jest.fn(),
  };

  const createContext = (user: any = null, meta: any = undefined, isPublic = false) => {
    const handler = jest.fn();
    const cls = jest.fn();

    const mockContext = {
      getHandler: () => handler,
      getClass: () => cls,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;

    reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: unknown) => {
      if (key === 'isPublic') return isPublic;
      if (key === 'menuPermission') return meta;
      return undefined;
    });

    guard = new MenuPermissionGuard(reflector, mockService as any);
    return mockContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═════════════════════════════════════════════════════
  // BYPASS SCENARIOS
  // ═════════════════════════════════════════════════════

  it('should allow public routes', async () => {
    const ctx = createContext(null, undefined, true);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when no @RequireMenuPermission metadata', async () => {
    const ctx = createContext({ id: 'u1' }, undefined);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should throw when no user on protected route', async () => {
    const ctx = createContext(null, { menuCode: 'LEADS', action: 'create', requireAll: true });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should allow super admin without calling service', async () => {
    const ctx = createContext(
      { id: 'u1', isSuperAdmin: true, tenantId: 't1', roleId: 'r1' },
      { menuCode: 'LEADS', action: 'create', requireAll: true },
    );
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockService.hasPermission).not.toHaveBeenCalled();
  });

  it('should throw when tenantId is missing', async () => {
    const ctx = createContext(
      { id: 'u1', roleId: 'r1' },
      { menuCode: 'LEADS', action: 'create', requireAll: true },
    );
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should throw when roleId is missing', async () => {
    const ctx = createContext(
      { id: 'u1', tenantId: 't1' },
      { menuCode: 'LEADS', action: 'create', requireAll: true },
    );
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  // ═════════════════════════════════════════════════════
  // SINGLE ACTION
  // ═════════════════════════════════════════════════════

  it('should allow when hasPermission returns true (single action)', async () => {
    mockService.hasPermission.mockResolvedValue(true);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'MANAGER' },
      { menuCode: 'LEADS', action: 'create', requireAll: true },
    );

    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockService.hasPermission).toHaveBeenCalledWith(
      't1', 'r1', 'LEADS', 'create', 'MANAGER',
    );
  });

  it('should throw ForbiddenException when hasPermission returns false', async () => {
    mockService.hasPermission.mockResolvedValue(false);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'VIEWER' },
      { menuCode: 'CONTACTS', action: 'delete', requireAll: true },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(mockService.hasPermission).toHaveBeenCalledWith(
      't1', 'r1', 'CONTACTS', 'delete', 'VIEWER',
    );
  });

  it('should use roleName fallback when role is undefined', async () => {
    mockService.hasPermission.mockResolvedValue(true);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', roleName: 'SALES_EXECUTIVE' },
      { menuCode: 'LEADS', action: 'edit', requireAll: true },
    );

    await guard.canActivate(ctx);
    expect(mockService.hasPermission).toHaveBeenCalledWith(
      't1', 'r1', 'LEADS', 'edit', 'SALES_EXECUTIVE',
    );
  });

  // ═════════════════════════════════════════════════════
  // MULTI-ACTION: requireAll = true (AND logic)
  // ═════════════════════════════════════════════════════

  it('should use hasAllPermissions when actions array + requireAll=true', async () => {
    mockService.hasAllPermissions.mockResolvedValue(true);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'ADMIN' },
      { menuCode: 'CONTACTS', action: 'view', actions: ['view', 'edit', 'delete'], requireAll: true },
    );

    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockService.hasAllPermissions).toHaveBeenCalledWith(
      't1', 'r1', 'CONTACTS', ['view', 'edit', 'delete'], 'ADMIN',
    );
    expect(mockService.hasAnyPermission).not.toHaveBeenCalled();
    expect(mockService.hasPermission).not.toHaveBeenCalled();
  });

  it('should throw when hasAllPermissions returns false', async () => {
    mockService.hasAllPermissions.mockResolvedValue(false);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'VIEWER' },
      { menuCode: 'LEADS', action: 'view', actions: ['edit', 'delete'], requireAll: true },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  // ═════════════════════════════════════════════════════
  // MULTI-ACTION: requireAll = false (OR logic)
  // ═════════════════════════════════════════════════════

  it('should use hasAnyPermission when actions array + requireAll=false', async () => {
    mockService.hasAnyPermission.mockResolvedValue(true);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'EDITOR' },
      { menuCode: 'QUOTATIONS', action: 'view', actions: ['edit', 'approve'], requireAll: false },
    );

    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockService.hasAnyPermission).toHaveBeenCalledWith(
      't1', 'r1', 'QUOTATIONS', ['edit', 'approve'], 'EDITOR',
    );
    expect(mockService.hasAllPermissions).not.toHaveBeenCalled();
  });

  it('should throw when hasAnyPermission returns false', async () => {
    mockService.hasAnyPermission.mockResolvedValue(false);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'VIEWER' },
      { menuCode: 'INVOICES', action: 'view', actions: ['approve', 'delete'], requireAll: false },
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  // ═════════════════════════════════════════════════════
  // ERROR MESSAGE FORMAT
  // ═════════════════════════════════════════════════════

  it('should include errorCode and Hindi message in ForbiddenException', async () => {
    mockService.hasPermission.mockResolvedValue(false);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'VIEWER' },
      { menuCode: 'CONTACTS', action: 'delete', requireAll: true },
    );

    try {
      await guard.canActivate(ctx);
      fail('Expected ForbiddenException');
    } catch (err: any) {
      const response = err.getResponse();
      expect(response.errorCode).toBe('MENU_PERMISSION_DENIED');
      expect(response.menuCode).toBe('CONTACTS');
      expect(response.action).toBe('delete');
      expect(response.messageHi).toBeDefined();
    }
  });

  it('should include joined action names for multi-action denials', async () => {
    mockService.hasAllPermissions.mockResolvedValue(false);

    const ctx = createContext(
      { id: 'u1', tenantId: 't1', roleId: 'r1', role: 'VIEWER' },
      { menuCode: 'LEADS', action: 'view', actions: ['edit', 'delete'], requireAll: true },
    );

    try {
      await guard.canActivate(ctx);
      fail('Expected ForbiddenException');
    } catch (err: any) {
      const response = err.getResponse();
      expect(response.action).toBe('edit, delete');
    }
  });
});
