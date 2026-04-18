import { Test, TestingModule } from '@nestjs/testing';
import { MenuPermissionService } from '../../application/services/menu-permission.service';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

describe('MenuPermissionService', () => {
  let service: MenuPermissionService;

  const mockPrisma = {
    roleMenuPermission: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    menu: {
      findMany: jest.fn(),
    },
    role: {
      findMany: jest.fn(),
    },
    permissionTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  (mockPrisma as any).identity = mockPrisma;
  (mockPrisma as any).platform = mockPrisma;

  const fullPermRecord = {
    canView: true, canCreate: true, canEdit: true, canDelete: true,
    canExport: true, canImport: true, canBulkUpdate: true, canBulkDelete: true,
    canApprove: true, canAssign: true, canTransfer: true,
    canViewAll: true, canEditAll: true, canDeleteAll: true,
    restrictedFields: null, inheritFromParent: true,
  };

  const viewOnlyRecord = {
    canView: true, canCreate: false, canEdit: false, canDelete: false,
    canExport: false, canImport: false, canBulkUpdate: false, canBulkDelete: false,
    canApprove: false, canAssign: false, canTransfer: false,
    canViewAll: false, canEditAll: false, canDeleteAll: false,
    restrictedFields: null, inheritFromParent: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuPermissionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(MenuPermissionService);
    jest.clearAllMocks();
    service.clearCache();
  });

  describe('hasPermission', () => {
    it('should return true for SUPER_ADMIN role', async () => {
      const result = await service.hasPermission('t1', 'r1', 'LEADS', 'create', 'SUPER_ADMIN');
      expect(result).toBe(true);
      expect(mockPrisma.roleMenuPermission.findMany).not.toHaveBeenCalled();
    });

    it('should return true for PLATFORM_ADMIN role', async () => {
      const result = await service.hasPermission('t1', 'r1', 'LEADS', 'create', 'PLATFORM_ADMIN');
      expect(result).toBe(true);
    });

    it('should return true when permission allowed', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...fullPermRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      const result = await service.hasPermission('t1', 'r1', 'LEADS', 'create', 'MANAGER');
      expect(result).toBe(true);
    });

    it('should return false when action not allowed', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...viewOnlyRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      const result = await service.hasPermission('t1', 'r1', 'LEADS', 'create', 'VIEWER');
      expect(result).toBe(false);
    });

    it('should return false when no permission record', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([]);
      mockPrisma.menu.findMany.mockResolvedValue([]);

      const result = await service.hasPermission('t1', 'r1', 'UNKNOWN', 'view');
      expect(result).toBe(false);
    });

    it('should check all 14 action types', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...fullPermRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      const actions = [
        'view', 'create', 'edit', 'delete', 'export', 'import',
        'bulkUpdate', 'bulkDelete', 'approve', 'assign', 'transfer',
        'viewAll', 'editAll', 'deleteAll',
      ] as const;

      for (const action of actions) {
        const result = await service.hasPermission('t1', 'r1', 'LEADS', action);
        expect(result).toBe(true);
      }
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if ANY action is allowed', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...viewOnlyRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'CONTACTS', parentId: null },
      ]);

      const result = await service.hasAnyPermission('t1', 'r1', 'CONTACTS', ['create', 'view']);
      expect(result).toBe(true);
    });

    it('should return false if NO action is allowed', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...viewOnlyRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'CONTACTS', parentId: null },
      ]);

      const result = await service.hasAnyPermission('t1', 'r1', 'CONTACTS', ['create', 'delete']);
      expect(result).toBe(false);
    });

    it('should bypass for SUPER_ADMIN', async () => {
      const result = await service.hasAnyPermission('t1', 'r1', 'LEADS', ['delete'], 'SUPER_ADMIN');
      expect(result).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if ALL actions allowed', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...fullPermRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      const result = await service.hasAllPermissions('t1', 'r1', 'LEADS', ['view', 'create', 'edit']);
      expect(result).toBe(true);
    });

    it('should return false if any action missing', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...viewOnlyRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      const result = await service.hasAllPermissions('t1', 'r1', 'LEADS', ['view', 'create']);
      expect(result).toBe(false);
    });
  });

  describe('getRestrictedFields', () => {
    it('should return restricted fields from permission', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        {
          menuId: 'm1', ...viewOnlyRecord,
          restrictedFields: { hiddenFields: ['salary'], readOnlyFields: ['createdAt'] },
        },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'CONTACTS', parentId: null },
      ]);

      const fields = await service.getRestrictedFields('t1', 'r1', 'CONTACTS');
      expect(fields.hiddenFields).toEqual(['salary']);
      expect(fields.readOnlyFields).toEqual(['createdAt']);
    });

    it('should return empty arrays when no restrictions', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([]);
      mockPrisma.menu.findMany.mockResolvedValue([]);

      const fields = await service.getRestrictedFields('t1', 'r1', 'UNKNOWN');
      expect(fields.hiddenFields).toEqual([]);
      expect(fields.readOnlyFields).toEqual([]);
    });
  });

  describe('getMatrix', () => {
    it('should return full matrix with all 14 flags', async () => {
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', name: 'Leads', menuType: 'ITEM', parentId: null },
        { id: 'm2', code: 'CONTACTS', name: 'Contacts', menuType: 'ITEM', parentId: null },
      ]);
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...fullPermRecord },
      ]);

      const matrix = await service.getMatrix('t1', 'r1');
      expect(matrix).toHaveLength(2);
      expect(matrix[0].permissions.canView).toBe(true);
      expect(matrix[0].permissions.canBulkUpdate).toBe(true);
      expect(matrix[0].permissions.canViewAll).toBe(true);
      // CONTACTS: no record → all false
      expect(matrix[1].permissions.canView).toBe(false);
    });
  });

  describe('getFullMatrix', () => {
    it('should return matrix for all roles', async () => {
      mockPrisma.role.findMany.mockResolvedValue([
        { id: 'r1', name: 'ADMIN', displayName: 'Admin' },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', name: 'Leads', parentId: null },
      ]);
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { roleId: 'r1', menuId: 'm1', ...fullPermRecord },
      ]);

      const result = await service.getFullMatrix('t1');
      expect(result.roles).toHaveLength(1);
      expect(result.menus).toHaveLength(1);
      expect(result.matrix['r1']['LEADS']!.canView).toBe(true);
    });
  });

  describe('setPermissions', () => {
    it('should upsert and invalidate cache', async () => {
      mockPrisma.roleMenuPermission.upsert.mockResolvedValue({});

      const result = await service.setPermissions('t1', 'r1', 'm1', 'LEADS', {
        canView: true, canCreate: true, canBulkUpdate: true,
      }, 'u1');

      expect(result.canView).toBe(true);
      expect(result.canCreate).toBe(true);
      expect(result.canBulkUpdate).toBe(true);
      expect(result.canDelete).toBe(false);
      expect(mockPrisma.roleMenuPermission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ createdById: 'u1' }),
        }),
      );
    });
  });

  describe('copyPermissions', () => {
    it('should copy all permissions from source to target', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', menu: { code: 'LEADS' }, ...fullPermRecord },
      ]);
      mockPrisma.roleMenuPermission.upsert.mockResolvedValue({});

      const count = await service.copyPermissions('t1', 'r1', 'r2', 'u1');
      expect(count).toBe(1);
      expect(mockPrisma.roleMenuPermission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            roleId: 'r2',
            canBulkUpdate: true,
            canTransfer: true,
            canViewAll: true,
          }),
        }),
      );
    });
  });

  describe('applyTemplate', () => {
    it('should apply JSON template to role', async () => {
      mockPrisma.permissionTemplate.findUnique.mockResolvedValue({
        id: 'tmpl-1',
        name: 'Read Only',
        permissions: {
          LEADS: { canView: true },
          CONTACTS: { canView: true, canExport: true },
        },
      });
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS' },
        { id: 'm2', code: 'CONTACTS' },
      ]);
      mockPrisma.roleMenuPermission.upsert.mockResolvedValue({});

      const count = await service.applyTemplate('t1', 'r1', 'tmpl-1', 'u1');
      expect(count).toBe(2);
    });

    it('should throw when template not found', async () => {
      mockPrisma.permissionTemplate.findUnique.mockResolvedValue(null);
      await expect(service.applyTemplate('t1', 'r1', 'bad-id')).rejects.toThrow('Permission template not found');
    });

    it('should skip menus not in tenant', async () => {
      mockPrisma.permissionTemplate.findUnique.mockResolvedValue({
        id: 'tmpl-1',
        name: 'Test',
        permissions: { LEADS: { canView: true }, NONEXISTENT: { canView: true } },
      });
      mockPrisma.menu.findMany.mockResolvedValue([{ id: 'm1', code: 'LEADS' }]);
      mockPrisma.roleMenuPermission.upsert.mockResolvedValue({});

      const count = await service.applyTemplate('t1', 'r1', 'tmpl-1');
      expect(count).toBe(1); // Only LEADS, NONEXISTENT skipped
    });
  });

  describe('applyTemplateByCode', () => {
    it('should find template by code and apply', async () => {
      mockPrisma.permissionTemplate.findUnique.mockResolvedValue({
        id: 'tmpl-1', name: 'Full Admin', code: 'FULL_ADMIN',
        permissions: { LEADS: { canView: true } },
      });
      mockPrisma.menu.findMany.mockResolvedValue([{ id: 'm1', code: 'LEADS' }]);
      mockPrisma.roleMenuPermission.upsert.mockResolvedValue({});

      const count = await service.applyTemplateByCode('t1', 'r1', 'FULL_ADMIN');
      expect(count).toBe(1);
    });

    it('should throw for unknown code', async () => {
      mockPrisma.permissionTemplate.findUnique.mockResolvedValue(null);
      await expect(service.applyTemplateByCode('t1', 'r1', 'BAD_CODE')).rejects.toThrow('Template not found');
    });
  });

  describe('deleteRolePermissions', () => {
    it('should delete all and invalidate cache', async () => {
      mockPrisma.roleMenuPermission.deleteMany.mockResolvedValue({ count: 5 });
      const count = await service.deleteRolePermissions('t1', 'r1');
      expect(count).toBe(5);
    });
  });

  describe('deleteMenuPermission', () => {
    it('should delete specific menu permission', async () => {
      mockPrisma.roleMenuPermission.deleteMany.mockResolvedValue({ count: 1 });
      await service.deleteMenuPermission('t1', 'r1', 'm1');
      expect(mockPrisma.roleMenuPermission.deleteMany).toHaveBeenCalledWith({
        where: { tenantId: 't1', roleId: 'r1', menuId: 'm1' },
      });
    });
  });

  describe('cache', () => {
    it('should use cache on second call', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...viewOnlyRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      await service.hasPermission('t1', 'r1', 'LEADS', 'view');
      await service.hasPermission('t1', 'r1', 'LEADS', 'view');

      // findMany called once for permissions + once for menus = 2 total, not 4
      expect(mockPrisma.roleMenuPermission.findMany).toHaveBeenCalledTimes(1);
    });

    it('should invalidate on set', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...viewOnlyRecord },
      ]);
      mockPrisma.menu.findMany.mockResolvedValue([
        { id: 'm1', code: 'LEADS', parentId: null },
      ]);

      await service.hasPermission('t1', 'r1', 'LEADS', 'view');

      mockPrisma.roleMenuPermission.upsert.mockResolvedValue({});
      await service.setPermissions('t1', 'r1', 'm1', 'LEADS', { canView: true });

      // After set, cache invalidated, next call should hit DB
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([
        { menuId: 'm1', ...fullPermRecord },
      ]);

      await service.hasPermission('t1', 'r1', 'LEADS', 'create');
      expect(mockPrisma.roleMenuPermission.findMany).toHaveBeenCalledTimes(2);
    });

    it('should clear all caches', () => {
      service.clearCache();
      // Should not throw
    });

    it('should invalidate tenant cache', async () => {
      mockPrisma.roleMenuPermission.findMany.mockResolvedValue([]);
      mockPrisma.menu.findMany.mockResolvedValue([]);

      await service.hasPermission('t1', 'r1', 'X', 'view');
      service.invalidateTenantCache('t1');

      await service.hasPermission('t1', 'r1', 'X', 'view');
      expect(mockPrisma.roleMenuPermission.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
