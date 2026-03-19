import { Test, TestingModule } from '@nestjs/testing';
import { MenuPermissionController } from '../../presentation/menu-permission.controller';
import { MenuPermissionService } from '../../application/services/menu-permission.service';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

describe('MenuPermissionController', () => {
  let controller: MenuPermissionController;

  const mockService = {
    getAllPermissionsForRole: jest.fn(),
    getPermissions: jest.fn(),
    getMatrix: jest.fn(),
    getFullMatrix: jest.fn(),
    setPermissions: jest.fn(),
    bulkSetPermissions: jest.fn(),
    copyPermissions: jest.fn(),
    getTemplates: jest.fn(),
    applyTemplate: jest.fn(),
    hasPermission: jest.fn(),
    getRestrictedFields: jest.fn(),
    deleteRolePermissions: jest.fn(),
    deleteMenuPermission: jest.fn(),
    invalidateTenantCache: jest.fn(),
  };

  const mockPrisma = {
    permissionTemplate: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuPermissionController],
      providers: [
        { provide: MenuPermissionService, useValue: mockService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get(MenuPermissionController);
    jest.clearAllMocks();
  });

  // ═════════════════════════════════════════════════════
  // GET PERMISSIONS
  // ═════════════════════════════════════════════════════

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', async () => {
      const permMap = new Map([
        ['LEADS', { menuId: 'm1', menuCode: 'LEADS', canView: true, canCreate: true }],
        ['CONTACTS', { menuId: 'm2', menuCode: 'CONTACTS', canView: true, canCreate: false }],
      ]);
      mockService.getAllPermissionsForRole.mockResolvedValue(permMap);

      const result = await controller.getRolePermissions('r1', 't1');
      expect((result as any).data).toHaveLength(2);
      expect(mockService.getAllPermissionsForRole).toHaveBeenCalledWith('t1', 'r1');
    });
  });

  describe('getMenuPermission', () => {
    it('should return permission for specific menu', async () => {
      const perm = { menuId: 'm1', menuCode: 'LEADS', canView: true, canCreate: true };
      mockService.getPermissions.mockResolvedValue(perm);

      const result = await controller.getMenuPermission('r1', 'LEADS', 't1');
      expect((result as any).data).toEqual(perm);
      expect(mockService.getPermissions).toHaveBeenCalledWith('t1', 'r1', 'LEADS');
    });
  });

  describe('getMatrix', () => {
    it('should return permission matrix for a role', async () => {
      const matrix = [
        {
          menuId: 'm1', menuCode: 'LEADS', menuName: 'Leads', menuType: 'ITEM', parentId: null,
          permissions: { canView: true, canCreate: true, canEdit: false, canDelete: false },
        },
      ];
      mockService.getMatrix.mockResolvedValue(matrix);

      const result = await controller.getMatrix('r1', 't1');
      expect((result as any).data).toEqual(matrix);
      expect(mockService.getMatrix).toHaveBeenCalledWith('t1', 'r1');
    });
  });

  describe('getFullMatrix', () => {
    it('should return full matrix for all roles', async () => {
      const fullMatrix = {
        roles: [{ id: 'r1', name: 'ADMIN', displayName: 'Admin' }],
        menus: [{ id: 'm1', code: 'LEADS', name: 'Leads', parentId: null }],
        matrix: { r1: { LEADS: { canView: true } } },
      };
      mockService.getFullMatrix.mockResolvedValue(fullMatrix);

      const result = await controller.getFullMatrix('t1');
      expect((result as any).data).toEqual(fullMatrix);
      expect(mockService.getFullMatrix).toHaveBeenCalledWith('t1');
    });
  });

  // ═════════════════════════════════════════════════════
  // SET PERMISSIONS
  // ═════════════════════════════════════════════════════

  describe('setMenuPermission', () => {
    it('should set permissions for a single menu', async () => {
      const record = {
        menuId: 'm1', menuCode: 'LEADS', canView: true, canCreate: true,
        canEdit: true, canDelete: false,
      };
      mockService.setPermissions.mockResolvedValue(record);

      const result = await controller.setMenuPermission(
        'r1', 'm1',
        { menuCode: 'LEADS', canView: true, canCreate: true, canEdit: true },
        't1', 'u1',
      );

      expect((result as any).data).toEqual(record);
      expect(mockService.setPermissions).toHaveBeenCalledWith(
        't1', 'r1', 'm1', 'LEADS',
        { canView: true, canCreate: true, canEdit: true },
        'u1',
      );
    });
  });

  describe('bulkSet', () => {
    it('should bulk set permissions', async () => {
      mockService.bulkSetPermissions.mockResolvedValue(3);

      const result = await controller.bulkSet(
        'r1',
        {
          permissions: [
            { menuId: 'm1', menuCode: 'LEADS', permissions: { canView: true } },
            { menuId: 'm2', menuCode: 'CONTACTS', permissions: { canView: true, canCreate: true } },
            { menuId: 'm3', menuCode: 'QUOTATIONS', permissions: { canView: true } },
          ],
        },
        't1', 'u1',
      );

      expect((result as any).data.count).toBe(3);
      expect(mockService.bulkSetPermissions).toHaveBeenCalledWith(
        't1', 'r1',
        expect.any(Array),
        'u1',
      );
    });
  });

  describe('copy', () => {
    it('should copy permissions between roles', async () => {
      mockService.copyPermissions.mockResolvedValue(10);

      const result = await controller.copy(
        { sourceRoleId: 'r1', targetRoleId: 'r2' },
        't1', 'u1',
      );

      expect((result as any).data.count).toBe(10);
      expect(mockService.copyPermissions).toHaveBeenCalledWith('t1', 'r1', 'r2', 'u1');
    });
  });

  // ═════════════════════════════════════════════════════
  // TEMPLATES
  // ═════════════════════════════════════════════════════

  describe('getTemplates', () => {
    it('should return all templates for tenant', async () => {
      mockService.getTemplates.mockResolvedValue([
        {
          id: 'tpl1', name: 'Full Admin', code: 'FULL_ADMIN',
          description: 'Full', isSystem: true,
          permissions: { DASHBOARD: { canView: true } },
        },
      ]);

      const result = await controller.getTemplates('t1');
      expect((result as any).data).toHaveLength(1);
      expect((result as any).data[0].code).toBe('FULL_ADMIN');
      expect(mockService.getTemplates).toHaveBeenCalledWith('t1');
    });
  });

  describe('createTemplate', () => {
    it('should create a custom permission template', async () => {
      const template = {
        id: 'tpl-new', name: 'Custom', code: 'CUSTOM',
        description: 'Custom template', tenantId: 't1',
        permissions: { LEADS: { canView: true, canEdit: true } },
      };
      mockPrisma.permissionTemplate.create.mockResolvedValue(template);

      const result = await controller.createTemplate(
        {
          name: 'Custom',
          code: 'CUSTOM',
          description: 'Custom template',
          permissions: { LEADS: { canView: true, canEdit: true } },
        },
        't1',
      );

      expect((result as any).data.code).toBe('CUSTOM');
      expect(mockPrisma.permissionTemplate.create).toHaveBeenCalledWith({
        data: {
          tenantId: 't1',
          name: 'Custom',
          code: 'CUSTOM',
          description: 'Custom template',
          permissions: { LEADS: { canView: true, canEdit: true } },
        },
      });
    });
  });

  describe('applyTemplate', () => {
    it('should apply a template to a role', async () => {
      mockService.applyTemplate.mockResolvedValue(15);

      const result = await controller.applyTemplate(
        { roleId: 'r1', templateId: 'tpl1' },
        't1', 'u1',
      );

      expect((result as any).data.count).toBe(15);
      expect(mockService.applyTemplate).toHaveBeenCalledWith('t1', 'r1', 'tpl1', 'u1');
    });
  });

  // ═════════════════════════════════════════════════════
  // CHECK
  // ═════════════════════════════════════════════════════

  describe('checkPermission', () => {
    it('should check current user permission', async () => {
      mockService.hasPermission.mockResolvedValue(true);

      const result = await controller.checkPermission('LEADS', 'create', {
        tenantId: 't1', roleId: 'r1', role: 'MANAGER',
      });

      expect((result as any).data.allowed).toBe(true);
      expect((result as any).data.menuCode).toBe('LEADS');
      expect((result as any).data.action).toBe('create');
    });

    it('should return false when permission denied', async () => {
      mockService.hasPermission.mockResolvedValue(false);

      const result = await controller.checkPermission('CONTACTS', 'delete', {
        tenantId: 't1', roleId: 'r1', role: 'VIEWER',
      });

      expect((result as any).data.allowed).toBe(false);
    });
  });

  describe('getRestrictedFields', () => {
    it('should return restricted fields for a menu', async () => {
      mockService.getRestrictedFields.mockResolvedValue({
        hiddenFields: ['salary'],
        readOnlyFields: ['email'],
      });

      const result = await controller.getRestrictedFields('CONTACTS', {
        tenantId: 't1', roleId: 'r1',
      });

      expect((result as any).data.hiddenFields).toEqual(['salary']);
      expect((result as any).data.readOnlyFields).toEqual(['email']);
    });
  });

  // ═════════════════════════════════════════════════════
  // DELETE
  // ═════════════════════════════════════════════════════

  describe('deleteRolePermissions', () => {
    it('should delete all permissions for a role', async () => {
      mockService.deleteRolePermissions.mockResolvedValue(8);

      const result = await controller.deleteRolePermissions('r1', 't1');
      expect((result as any).data.count).toBe(8);
      expect(mockService.deleteRolePermissions).toHaveBeenCalledWith('t1', 'r1');
    });
  });

  describe('deleteMenuPermission', () => {
    it('should delete specific menu permission', async () => {
      mockService.deleteMenuPermission.mockResolvedValue(undefined);

      const result = await controller.deleteMenuPermission('r1', 'm1', 't1');
      expect((result as any).data).toBeNull();
      expect(mockService.deleteMenuPermission).toHaveBeenCalledWith('t1', 'r1', 'm1');
    });
  });

  // ═════════════════════════════════════════════════════
  // CACHE
  // ═════════════════════════════════════════════════════

  describe('clearCache', () => {
    it('should clear all permission caches for tenant', async () => {
      const result = await controller.clearCache('t1');
      expect((result as any).data).toBeNull();
      expect(mockService.invalidateTenantCache).toHaveBeenCalledWith('t1');
    });
  });
});
