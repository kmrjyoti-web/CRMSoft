import {
  MENU_PERMISSION_KEY,
  RequireMenuPermission,
  CanView, CanCreate, CanEdit, CanDelete,
  CanExport, CanImport, CanApprove, CanAssign,
  FullAccess,
} from '../../../../../../core/permissions/decorators/require-menu-permission.decorator';

describe('RequireMenuPermission decorator', () => {
  // ═════════════════════════════════════════════════════
  // SINGLE ACTION
  // ═════════════════════════════════════════════════════

  it('should set metadata with menuCode and single action', () => {
    class TestController {
      @RequireMenuPermission('LEADS', 'create')
      create() {}
    }

    const metadata = Reflect.getMetadata(
      MENU_PERMISSION_KEY,
      TestController.prototype.create,
    );

    expect(metadata).toEqual({
      menuCode: 'LEADS',
      action: 'create',
      actions: undefined,
      requireAll: true,
    });
  });

  it('should support all action types', () => {
    class TestController {
      @RequireMenuPermission('CONTACTS', 'export')
      exportContacts() {}

      @RequireMenuPermission('LEADS', 'approve')
      approveLeads() {}

      @RequireMenuPermission('INVOICES', 'assign')
      assignInvoices() {}

      @RequireMenuPermission('LEADS', 'bulkUpdate')
      bulkUpdate() {}

      @RequireMenuPermission('CONTACTS', 'viewAll')
      viewAll() {}
    }

    const exportMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.exportContacts);
    expect(exportMeta.action).toBe('export');

    const approveMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.approveLeads);
    expect(approveMeta.action).toBe('approve');

    const assignMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.assignInvoices);
    expect(assignMeta.action).toBe('assign');

    const bulkMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.bulkUpdate);
    expect(bulkMeta.action).toBe('bulkUpdate');

    const viewAllMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.viewAll);
    expect(viewAllMeta.action).toBe('viewAll');
  });

  // ═════════════════════════════════════════════════════
  // MULTI-ACTION
  // ═════════════════════════════════════════════════════

  it('should set actions array when passed an array', () => {
    class TestController {
      @RequireMenuPermission('CONTACTS', ['view', 'edit', 'delete'])
      manage() {}
    }

    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.manage);
    expect(metadata).toEqual({
      menuCode: 'CONTACTS',
      action: 'view', // first action as fallback
      actions: ['view', 'edit', 'delete'],
      requireAll: true, // default
    });
  });

  it('should support requireAll=false for OR logic', () => {
    class TestController {
      @RequireMenuPermission('QUOTATIONS', ['edit', 'approve'], false)
      editOrApprove() {}
    }

    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.editOrApprove);
    expect(metadata.actions).toEqual(['edit', 'approve']);
    expect(metadata.requireAll).toBe(false);
  });

  it('should default requireAll to true', () => {
    class TestController {
      @RequireMenuPermission('LEADS', ['create', 'edit'])
      createAndEdit() {}
    }

    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.createAndEdit);
    expect(metadata.requireAll).toBe(true);
  });

  // ═════════════════════════════════════════════════════
  // SHORTHAND DECORATORS
  // ═════════════════════════════════════════════════════

  it('CanView should set action=view', () => {
    class TestController {
      @CanView('DASHBOARD')
      dashboard() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.dashboard);
    expect(metadata.menuCode).toBe('DASHBOARD');
    expect(metadata.action).toBe('view');
  });

  it('CanCreate should set action=create', () => {
    class TestController {
      @CanCreate('CONTACTS')
      createContact() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.createContact);
    expect(metadata.action).toBe('create');
  });

  it('CanEdit should set action=edit', () => {
    class TestController {
      @CanEdit('LEADS')
      editLead() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.editLead);
    expect(metadata.action).toBe('edit');
  });

  it('CanDelete should set action=delete', () => {
    class TestController {
      @CanDelete('LEADS')
      deleteLead() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.deleteLead);
    expect(metadata.action).toBe('delete');
  });

  it('CanExport should set action=export', () => {
    class TestController {
      @CanExport('REPORTS')
      exportReport() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.exportReport);
    expect(metadata.action).toBe('export');
  });

  it('CanImport should set action=import', () => {
    class TestController {
      @CanImport('CONTACTS')
      importContacts() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.importContacts);
    expect(metadata.action).toBe('import');
  });

  it('CanApprove should set action=approve', () => {
    class TestController {
      @CanApprove('QUOTATIONS')
      approveQuotation() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.approveQuotation);
    expect(metadata.action).toBe('approve');
  });

  it('CanAssign should set action=assign', () => {
    class TestController {
      @CanAssign('TICKETS')
      assignTicket() {}
    }
    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.assignTicket);
    expect(metadata.action).toBe('assign');
  });

  // ═════════════════════════════════════════════════════
  // FULL ACCESS
  // ═════════════════════════════════════════════════════

  it('FullAccess should set all 4 CRUD actions with requireAll=true', () => {
    class TestController {
      @FullAccess('SETTINGS')
      fullAccess() {}
    }

    const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.fullAccess);
    expect(metadata.menuCode).toBe('SETTINGS');
    expect(metadata.actions).toEqual(['view', 'create', 'edit', 'delete']);
    expect(metadata.requireAll).toBe(true);
  });

  describe('edge cases', () => {
    it('same menuCode with different actions produces independent metadata per method', () => {
      class TestController {
        @RequireMenuPermission('CONTACTS', 'view')
        viewContacts() {}

        @RequireMenuPermission('CONTACTS', 'delete')
        deleteContacts() {}
      }
      const viewMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.viewContacts);
      const deleteMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.deleteContacts);
      expect(viewMeta.action).toBe('view');
      expect(deleteMeta.action).toBe('delete');
      expect(viewMeta.menuCode).toBe(deleteMeta.menuCode);
    });

    it('single-element array should set actions array and action to the sole element', () => {
      class TestController {
        @RequireMenuPermission('REPORTS', ['export'])
        exportOnly() {}
      }
      const metadata = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.exportOnly);
      expect(metadata.actions).toEqual(['export']);
      expect(metadata.action).toBe('export');
      expect(metadata.requireAll).toBe(true);
    });

    it('different menuCodes are isolated and do not share metadata', () => {
      class TestController {
        @CanView('LEADS')
        viewLeads() {}

        @CanView('CONTACTS')
        viewContacts() {}
      }
      const leadsMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.viewLeads);
      const contactsMeta = Reflect.getMetadata(MENU_PERMISSION_KEY, TestController.prototype.viewContacts);
      expect(leadsMeta.menuCode).toBe('LEADS');
      expect(contactsMeta.menuCode).toBe('CONTACTS');
    });
  });
});
