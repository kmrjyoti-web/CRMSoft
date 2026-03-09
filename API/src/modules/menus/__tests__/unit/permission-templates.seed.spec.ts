import { PERMISSION_TEMPLATES, seedPermissionTemplates } from '../../../../../prisma/seeds/permission-templates.seed';

describe('Permission Templates Seed', () => {
  describe('PERMISSION_TEMPLATES', () => {
    it('should have 6 templates', () => {
      expect(PERMISSION_TEMPLATES).toHaveLength(6);
    });

    it('should have unique codes', () => {
      const codes = PERMISSION_TEMPLATES.map((t) => t.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('should have all system templates', () => {
      expect(PERMISSION_TEMPLATES.every((t) => t.isSystem)).toBe(true);
    });

    it('should have exactly one default template', () => {
      const defaults = PERMISSION_TEMPLATES.filter((t) => t.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].code).toBe('SALES_EXECUTIVE');
    });

    // ═════════════════════════════════════════════════════
    // FULL_ADMIN
    // ═════════════════════════════════════════════════════

    it('FULL_ADMIN should have all permissions on all menus', () => {
      const fullAdmin = PERMISSION_TEMPLATES.find((t) => t.code === 'FULL_ADMIN');
      expect(fullAdmin).toBeDefined();
      expect(fullAdmin!.permissions.DASHBOARD.canView).toBe(true);
      expect(fullAdmin!.permissions.CONTACTS.canCreate).toBe(true);
      expect(fullAdmin!.permissions.LEADS.canAssign).toBe(true);
      expect(fullAdmin!.permissions.LEADS.canBulkDelete).toBe(true);
      expect(fullAdmin!.permissions.LEADS.canViewAll).toBe(true);
      expect(fullAdmin!.permissions.QUOTATIONS.canApprove).toBe(true);
    });

    it('FULL_ADMIN should have the most menu entries', () => {
      const fullAdmin = PERMISSION_TEMPLATES.find((t) => t.code === 'FULL_ADMIN');
      const menuCount = Object.keys(fullAdmin!.permissions).length;
      expect(menuCount).toBeGreaterThanOrEqual(10);
    });

    // ═════════════════════════════════════════════════════
    // READ_ONLY
    // ═════════════════════════════════════════════════════

    it('READ_ONLY should only have canView per menu', () => {
      const readOnly = PERMISSION_TEMPLATES.find((t) => t.code === 'READ_ONLY');
      expect(readOnly).toBeDefined();

      for (const [, perms] of Object.entries(readOnly!.permissions)) {
        expect(perms.canView).toBe(true);
        // Should not have write/modify permissions
        expect(perms.canCreate).toBeUndefined();
        expect(perms.canEdit).toBeUndefined();
        expect(perms.canDelete).toBeUndefined();
      }
    });

    // ═════════════════════════════════════════════════════
    // SALES_MANAGER
    // ═════════════════════════════════════════════════════

    it('SALES_MANAGER should have assign on LEADS and ACTIVITIES', () => {
      const sm = PERMISSION_TEMPLATES.find((t) => t.code === 'SALES_MANAGER');
      expect(sm).toBeDefined();
      expect(sm!.permissions.LEADS.canAssign).toBe(true);
      expect(sm!.permissions.LEADS.canTransfer).toBe(true);
      expect(sm!.permissions.ACTIVITIES.canAssign).toBe(true);
    });

    // ═════════════════════════════════════════════════════
    // DATA_ENTRY
    // ═════════════════════════════════════════════════════

    it('DATA_ENTRY should have import on CONTACTS and LEADS', () => {
      const de = PERMISSION_TEMPLATES.find((t) => t.code === 'DATA_ENTRY');
      expect(de).toBeDefined();
      expect(de!.permissions.CONTACTS.canImport).toBe(true);
      expect(de!.permissions.LEADS.canImport).toBe(true);
      // No delete
      expect(de!.permissions.CONTACTS.canDelete).toBeUndefined();
    });

    // ═════════════════════════════════════════════════════
    // APPROVER
    // ═════════════════════════════════════════════════════

    it('APPROVER should have approve on QUOTATIONS and INVOICES', () => {
      const approver = PERMISSION_TEMPLATES.find((t) => t.code === 'APPROVER');
      expect(approver).toBeDefined();
      expect(approver!.permissions.QUOTATIONS.canApprove).toBe(true);
      expect(approver!.permissions.INVOICES.canApprove).toBe(true);
      expect(approver!.permissions.QUOTATIONS.canViewAll).toBe(true);
    });

    // ═════════════════════════════════════════════════════
    // JSON STRUCTURE
    // ═════════════════════════════════════════════════════

    it('permissions should be a map of menuCode → permission flags', () => {
      for (const template of PERMISSION_TEMPLATES) {
        expect(typeof template.permissions).toBe('object');
        for (const [menuCode, flags] of Object.entries(template.permissions)) {
          expect(typeof menuCode).toBe('string');
          expect(typeof flags).toBe('object');
          // At minimum, canView should be a boolean
          if ('canView' in flags) {
            expect(typeof flags.canView).toBe('boolean');
          }
        }
      }
    });
  });

  describe('seedPermissionTemplates', () => {
    it('should upsert all 6 templates', async () => {
      const mockPrisma = {
        permissionTemplate: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };

      const count = await seedPermissionTemplates(mockPrisma as any);
      expect(count).toBe(6);
      expect(mockPrisma.permissionTemplate.upsert).toHaveBeenCalledTimes(6);
    });

    it('should use code as unique key for upsert', async () => {
      const mockPrisma = {
        permissionTemplate: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };

      await seedPermissionTemplates(mockPrisma as any);

      const firstCall = mockPrisma.permissionTemplate.upsert.mock.calls[0][0];
      expect(firstCall.where).toEqual({ code: 'FULL_ADMIN' });
    });

    it('should store permissions as JSON in create data', async () => {
      const mockPrisma = {
        permissionTemplate: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };

      await seedPermissionTemplates(mockPrisma as any);

      const fullAdminCall = mockPrisma.permissionTemplate.upsert.mock.calls[0][0];
      expect(fullAdminCall.create.permissions).toBeDefined();
      expect(typeof fullAdminCall.create.permissions).toBe('object');
      expect(fullAdminCall.create.permissions.DASHBOARD).toBeDefined();
      expect(fullAdminCall.create.isSystem).toBe(true);
      expect(fullAdminCall.create.tenantId).toBeNull();
    });

    it('should set isDefault in create and update data', async () => {
      const mockPrisma = {
        permissionTemplate: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };

      await seedPermissionTemplates(mockPrisma as any);

      // SALES_EXECUTIVE is the 3rd template (index 2), isDefault: true
      const salesExecCall = mockPrisma.permissionTemplate.upsert.mock.calls[2][0];
      expect(salesExecCall.create.isDefault).toBe(true);
      expect(salesExecCall.update.isDefault).toBe(true);
    });
  });
});
