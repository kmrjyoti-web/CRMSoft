import { GetMyMenuHandler } from '../../application/queries/get-my-menu/get-my-menu.handler';
import { GetMyMenuQuery } from '../../application/queries/get-my-menu/get-my-menu.query';

describe('GetMyMenuHandler', () => {
  let handler: GetMyMenuHandler;
  let prisma: any;

  const makeMenu = (overrides: any = {}) => ({
    id: 'id-1', name: 'Test', code: 'TEST', icon: null, route: null,
    menuType: 'ITEM', sortOrder: 0, permissionModule: null,
    permissionAction: null, badgeColor: null, badgeText: null,
    openInNewTab: false, parentId: null, isActive: true,
    ...overrides,
  });

  // Full CRM sidebar menus for testing
  const allMenus = [
    makeMenu({ id: 'dash', name: 'Dashboard', code: 'DASHBOARD', route: '/dashboard', permissionModule: 'dashboard', permissionAction: 'read', sortOrder: 0 }),
    makeMenu({ id: 'div1', name: 'Div 1', code: 'DIV_1', menuType: 'DIVIDER', sortOrder: 1 }),
    makeMenu({ id: 'contacts-group', name: 'Contacts', code: 'CONTACTS_GROUP', menuType: 'GROUP', sortOrder: 2 }),
    makeMenu({ id: 'raw', name: 'Raw Contacts', code: 'RAW_CONTACTS', route: '/raw-contacts', parentId: 'contacts-group', permissionModule: 'contacts', permissionAction: 'read', sortOrder: 0 }),
    makeMenu({ id: 'verified', name: 'Verified', code: 'CONTACTS', route: '/contacts', parentId: 'contacts-group', permissionModule: 'contacts', permissionAction: 'read', sortOrder: 1 }),
    makeMenu({ id: 'leads', name: 'Leads', code: 'LEADS', route: '/leads', permissionModule: 'leads', permissionAction: 'read', sortOrder: 3 }),
    makeMenu({ id: 'div2', name: 'Div 2', code: 'DIV_2', menuType: 'DIVIDER', sortOrder: 4 }),
    makeMenu({ id: 'admin-group', name: 'Admin', code: 'ADMIN_GROUP', menuType: 'GROUP', sortOrder: 5 }),
    makeMenu({ id: 'admin-emp', name: 'Employees', code: 'ADMIN_EMP', route: '/admin/employees', parentId: 'admin-group', permissionModule: 'users', permissionAction: 'read', sortOrder: 0 }),
    makeMenu({ id: 'admin-roles', name: 'Roles', code: 'ADMIN_ROLES', route: '/admin/roles', parentId: 'admin-group', permissionModule: 'roles', permissionAction: 'read', sortOrder: 1 }),
    makeMenu({ id: 'public', name: 'Help', code: 'HELP', route: '/help', sortOrder: 6 }),
    makeMenu({ id: 'inactive', name: 'Old', code: 'OLD', route: '/old', isActive: false, sortOrder: 7 }),
  ];

  beforeEach(() => {
    prisma = {
      menu: { findMany: jest.fn().mockResolvedValue(allMenus.filter(m => m.isActive)) },
      rolePermission: { findMany: jest.fn().mockResolvedValue([]) },
      tenant: { findFirst: jest.fn().mockResolvedValue({ id: 'default-tenant-id', slug: 'default' }) },
    };
    const configService = { get: jest.fn().mockReturnValue(undefined) } as any;
    handler = new GetMyMenuHandler(prisma, configService);
  });

  it('SUPER_ADMIN sees all active menus', async () => {
    const result = await handler.execute(new GetMyMenuQuery('u1', 'r1', 'SUPER_ADMIN'));
    // Should include Dashboard, Contacts group (with children), Leads, Admin group, Help, dividers
    const codes = flatCodes(result);
    expect(codes).toContain('DASHBOARD');
    expect(codes).toContain('CONTACTS_GROUP');
    expect(codes).toContain('ADMIN_GROUP');
    expect(codes).toContain('HELP');
    expect(codes).not.toContain('OLD'); // inactive excluded
  });

  it('SALES_EXEC sees only permitted menus (no Admin section)', async () => {
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: { module: 'dashboard', action: 'read' } },
      { permission: { module: 'leads', action: 'read' } },
      { permission: { module: 'contacts', action: 'read' } },
    ]);
    const result = await handler.execute(new GetMyMenuQuery('u2', 'r2', 'SALES_EXEC'));
    const codes = flatCodes(result);
    expect(codes).toContain('DASHBOARD');
    expect(codes).toContain('LEADS');
    expect(codes).toContain('CONTACTS_GROUP');
    expect(codes).not.toContain('ADMIN_GROUP');
    expect(codes).not.toContain('ADMIN_EMP');
  });

  it('Groups with no visible children are hidden', async () => {
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: { module: 'dashboard', action: 'read' } },
    ]);
    const result = await handler.execute(new GetMyMenuQuery('u3', 'r3', 'VIEWER'));
    const codes = flatCodes(result);
    expect(codes).not.toContain('CONTACTS_GROUP');
    expect(codes).not.toContain('ADMIN_GROUP');
  });

  it('Public menus (no permission fields) are visible to everyone', async () => {
    const result = await handler.execute(new GetMyMenuQuery('u4', 'r4', 'VIEWER'));
    const codes = flatCodes(result);
    expect(codes).toContain('HELP');
  });

  it('Dividers between hidden sections are removed', async () => {
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: { module: 'dashboard', action: 'read' } },
    ]);
    const result = await handler.execute(new GetMyMenuQuery('u5', 'r5', 'VIEWER'));
    // Only Dashboard + Help visible, dividers should be cleaned up
    const types = result.map(r => r.menuType);
    // No consecutive dividers, no trailing divider
    for (let i = 0; i < types.length; i++) {
      if (types[i] === 'DIVIDER') {
        expect(i).toBeGreaterThan(0);
        expect(types[i - 1]).not.toBe('DIVIDER');
      }
    }
    if (types.length > 0) {
      expect(types[types.length - 1]).not.toBe('DIVIDER');
    }
  });

  it('Inactive menus are excluded', async () => {
    const result = await handler.execute(new GetMyMenuQuery('u1', 'r1', 'SUPER_ADMIN'));
    const codes = flatCodes(result);
    expect(codes).not.toContain('OLD');
  });

  it('Returns correct nested structure (GROUP → children)', async () => {
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: { module: 'contacts', action: 'read' } },
    ]);
    const result = await handler.execute(new GetMyMenuQuery('u6', 'r6', 'EXEC'));
    const contactsGroup = result.find(m => m.code === 'CONTACTS_GROUP');
    expect(contactsGroup).toBeDefined();
    expect(contactsGroup!.children.length).toBe(2);
    expect(contactsGroup!.children[0].code).toBe('RAW_CONTACTS');
  });
});

/** Flatten all codes from a nested tree. */
function flatCodes(items: any[]): string[] {
  const codes: string[] = [];
  for (const item of items) {
    codes.push(item.code);
    if (item.children) codes.push(...flatCodes(item.children));
  }
  return codes;
}
