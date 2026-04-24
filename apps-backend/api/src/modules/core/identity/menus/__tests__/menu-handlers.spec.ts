import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BulkSeedMenusHandler } from '../application/commands/bulk-seed-menus/bulk-seed-menus.handler';
import { CreateMenuHandler } from '../application/commands/create-menu/create-menu.handler';
import { DeactivateMenuHandler } from '../application/commands/deactivate-menu/deactivate-menu.handler';
import { ReorderMenusHandler } from '../application/commands/reorder-menus/reorder-menus.handler';
import { UpdateMenuHandler } from '../application/commands/update-menu/update-menu.handler';
import { GetMenuByIdHandler } from '../application/queries/get-menu-by-id/get-menu-by-id.handler';
import { GetMenuTreeHandler } from '../application/queries/get-menu-tree/get-menu-tree.handler';
import { GetMyMenuHandler } from '../application/queries/get-my-menu/get-my-menu.handler';
import { BulkSeedMenusCommand } from '../application/commands/bulk-seed-menus/bulk-seed-menus.command';
import { CreateMenuCommand } from '../application/commands/create-menu/create-menu.command';
import { DeactivateMenuCommand } from '../application/commands/deactivate-menu/deactivate-menu.command';
import { ReorderMenusCommand } from '../application/commands/reorder-menus/reorder-menus.command';
import { UpdateMenuCommand } from '../application/commands/update-menu/update-menu.command';
import { GetMenuByIdQuery } from '../application/queries/get-menu-by-id/get-menu-by-id.query';
import { GetMenuTreeQuery } from '../application/queries/get-menu-tree/get-menu-tree.query';
import { GetMyMenuQuery } from '../application/queries/get-my-menu/get-my-menu.query';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function makeMenu(overrides: Record<string, unknown> = {}) {
  return {
    id: 'menu-1',
    name: 'Dashboard',
    code: 'DASHBOARD',
    icon: 'cil-speedometer',
    route: '/dashboard',
    menuType: 'ITEM',
    sortOrder: 0,
    isActive: true,
    parentId: null,
    permissionModule: null,
    permissionAction: null,
    badgeColor: null,
    badgeText: null,
    openInNewTab: false,
    isAdminOnly: false,
    requiresCredential: false,
    credentialKey: null,
    businessTypeApplicability: ['ALL'],
    autoEnableWithModule: null,
    terminologyKey: null,
    children: [],
    parent: null,
    tenantId: 'tenant-1',
    ...overrides,
  };
}

function buildPrisma() {
  return {
    identity: {
      menu: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      tenant: {
        findFirst: jest.fn(),
      },
      rolePermission: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      terminologyOverride: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((ops: any[]) => Promise.all(ops)),
    },
    platform: {
      tenantModule: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      businessTypeRegistry: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    },
    $transaction: jest.fn().mockImplementation((ops: any[]) => Promise.all(ops)),
  } as any;
}

function buildConfig(values: Record<string, string> = {}) {
  return { get: jest.fn((key: string) => values[key] || undefined) } as any;
}

// ---------------------------------------------------------------------------
// BulkSeedMenusHandler
// ---------------------------------------------------------------------------

describe('BulkSeedMenusHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let config: ReturnType<typeof buildConfig>;
  let handler: BulkSeedMenusHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    config = buildConfig({ DEFAULT_TENANT_ID: 'tenant-default' });
    prisma.identity.menu.findMany.mockResolvedValue([]);
    prisma.identity.menu.deleteMany.mockResolvedValue({ count: 0 });
    prisma.identity.menu.create.mockImplementation((args: any) =>
      Promise.resolve({ id: `menu-${Math.random()}`, ...args.data }),
    );
    handler = new BulkSeedMenusHandler(prisma, config);
  });

  it('should seed menus and return count', async () => {
    const menus = [
      { name: 'Dashboard', code: 'DASHBOARD', menuType: 'ITEM' },
      { name: 'Leads', code: 'LEADS', menuType: 'GROUP', children: [
        { name: 'All Leads', code: 'ALL_LEADS', menuType: 'ITEM' },
      ]},
    ];
    const cmd = new BulkSeedMenusCommand(menus as any, 'tenant-1');
    const result = await handler.execute(cmd);
    expect(result.seeded).toBe(3); // 2 parents + 1 child
    expect(prisma.identity.menu.create).toHaveBeenCalledTimes(3);
  });

  it('should use DEFAULT_TENANT_ID for super admin without tenantId', async () => {
    const cmd = new BulkSeedMenusCommand([], undefined, true);
    await handler.execute(cmd);
    expect(config.get).toHaveBeenCalledWith('DEFAULT_TENANT_ID');
  });

  it('should look up default tenant when DEFAULT_TENANT_ID env not set', async () => {
    const configNoEnv = buildConfig({});
    prisma.identity.tenant.findFirst.mockResolvedValue({ id: 'tenant-from-db' });
    const h = new BulkSeedMenusHandler(prisma, configNoEnv);
    const cmd = new BulkSeedMenusCommand([], undefined, true);
    await h.execute(cmd);
    expect(prisma.identity.tenant.findFirst).toHaveBeenCalledWith({ where: { slug: 'default' } });
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.create.mockRejectedValue(new Error('Create failed'));
    const cmd = new BulkSeedMenusCommand(
      [{ name: 'X', code: 'X', menuType: 'ITEM' }] as any, 'tenant-1',
    );
    await expect(handler.execute(cmd)).rejects.toThrow('Create failed');
  });
});

// ---------------------------------------------------------------------------
// CreateMenuHandler
// ---------------------------------------------------------------------------

describe('CreateMenuHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: CreateMenuHandler;
  const menu = makeMenu();

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.menu.findFirst.mockResolvedValue(null); // no duplicate
    prisma.identity.menu.create.mockResolvedValue(menu);
    handler = new CreateMenuHandler(prisma);
  });

  it('should create menu and return it', async () => {
    const cmd = new CreateMenuCommand('Dashboard', 'DASHBOARD');
    const result = await handler.execute(cmd);
    expect(prisma.identity.menu.create).toHaveBeenCalled();
    expect(result).toEqual(menu);
  });

  it('should auto-generate code from name when code not provided', async () => {
    const cmd = new CreateMenuCommand('My New Menu');
    await handler.execute(cmd);
    const data = prisma.identity.menu.create.mock.calls[0][0].data;
    expect(data.code).toBe('MY_NEW_MENU');
  });

  it('should throw ConflictException when code already exists', async () => {
    prisma.identity.menu.findFirst.mockResolvedValue(menu);
    const cmd = new CreateMenuCommand('Dashboard', 'DASHBOARD');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when parentId not found', async () => {
    prisma.identity.menu.findFirst.mockResolvedValue(null);
    prisma.identity.menu.findUnique.mockResolvedValue(null);
    const cmd = new CreateMenuCommand('Child', 'CHILD', undefined, undefined, 'nonexistent-parent');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should validate parent exists when parentId provided', async () => {
    const parentMenu = makeMenu({ id: 'parent-1', code: 'PARENT' });
    prisma.identity.menu.findFirst.mockResolvedValue(null);
    prisma.identity.menu.findUnique.mockResolvedValue(parentMenu);
    prisma.identity.menu.create.mockResolvedValue(makeMenu({ parentId: 'parent-1' }));

    const cmd = new CreateMenuCommand('Child', 'CHILD', undefined, undefined, 'parent-1');
    await handler.execute(cmd);
    expect(prisma.identity.menu.findUnique).toHaveBeenCalledWith({ where: { id: 'parent-1' } });
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.create.mockRejectedValue(new Error('Insert failed'));
    const cmd = new CreateMenuCommand('Dashboard');
    await expect(handler.execute(cmd)).rejects.toThrow('Insert failed');
  });
});

// ---------------------------------------------------------------------------
// DeactivateMenuHandler
// ---------------------------------------------------------------------------

describe('DeactivateMenuHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: DeactivateMenuHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new DeactivateMenuHandler(prisma);
  });

  it('should deactivate menu and all descendants', async () => {
    const menu = makeMenu();
    const child = makeMenu({ id: 'child-1', parentId: 'menu-1' });

    prisma.identity.menu.findUnique.mockResolvedValue(menu);
    // collectDescendantIds: first call returns child, second call returns [] (no grandchildren)
    prisma.identity.menu.findMany
      .mockResolvedValueOnce([child])
      .mockResolvedValueOnce([]);
    prisma.identity.menu.updateMany.mockResolvedValue({ count: 2 });

    const result = await handler.execute(new DeactivateMenuCommand('menu-1'));
    expect(result.deactivated).toBe(2); // menu + 1 child
    expect(prisma.identity.menu.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it('should throw NotFoundException when menu not found', async () => {
    prisma.identity.menu.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new DeactivateMenuCommand('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should deactivate only root when no children', async () => {
    prisma.identity.menu.findUnique.mockResolvedValue(makeMenu());
    prisma.identity.menu.findMany.mockResolvedValue([]);
    prisma.identity.menu.updateMany.mockResolvedValue({ count: 1 });

    const result = await handler.execute(new DeactivateMenuCommand('menu-1'));
    expect(result.deactivated).toBe(1);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new DeactivateMenuCommand('menu-1'))).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// ReorderMenusHandler
// ---------------------------------------------------------------------------

describe('ReorderMenusHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: ReorderMenusHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.menu.update.mockResolvedValue(makeMenu());
    prisma.identity.$transaction.mockImplementation((ops: any[]) => Promise.all(ops));
    handler = new ReorderMenusHandler(prisma);
  });

  it('should update sortOrder for each id and return count', async () => {
    const cmd = new ReorderMenusCommand(null, ['menu-1', 'menu-2', 'menu-3']);
    const result = await handler.execute(cmd);
    expect(result.reordered).toBe(3);
    expect(prisma.identity.menu.update).toHaveBeenCalledTimes(3);
    expect(prisma.identity.menu.update).toHaveBeenCalledWith({ where: { id: 'menu-1' }, data: { sortOrder: 0 } });
    expect(prisma.identity.menu.update).toHaveBeenCalledWith({ where: { id: 'menu-2' }, data: { sortOrder: 1 } });
  });

  it('should run updates in a transaction', async () => {
    const cmd = new ReorderMenusCommand(null, ['menu-1', 'menu-2']);
    await handler.execute(cmd);
    expect(prisma.identity.$transaction).toHaveBeenCalled();
  });

  it('should propagate transaction errors', async () => {
    prisma.identity.$transaction.mockRejectedValue(new Error('Transaction failed'));
    const cmd = new ReorderMenusCommand(null, ['menu-1']);
    await expect(handler.execute(cmd)).rejects.toThrow('Transaction failed');
  });
});

// ---------------------------------------------------------------------------
// UpdateMenuHandler
// ---------------------------------------------------------------------------

describe('UpdateMenuHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: UpdateMenuHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new UpdateMenuHandler(prisma);
  });

  it('should update menu when found', async () => {
    const menu = makeMenu();
    const updated = makeMenu({ name: 'Updated Dashboard' });
    prisma.identity.menu.findUnique.mockResolvedValue(menu);
    prisma.identity.menu.update.mockResolvedValue(updated);

    const cmd = new UpdateMenuCommand('menu-1', { name: 'Updated Dashboard' });
    const result = await handler.execute(cmd);
    expect(result).toEqual(updated);
    expect(prisma.identity.menu.update).toHaveBeenCalledWith({
      where: { id: 'menu-1' },
      data: { name: 'Updated Dashboard' },
    });
  });

  it('should throw NotFoundException when menu not found', async () => {
    prisma.identity.menu.findUnique.mockResolvedValue(null);
    const cmd = new UpdateMenuCommand('nonexistent', { name: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when menu is its own parent', async () => {
    prisma.identity.menu.findUnique.mockResolvedValue(makeMenu());
    const cmd = new UpdateMenuCommand('menu-1', { parentId: 'menu-1' });
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when new parent not found', async () => {
    prisma.identity.menu.findUnique
      .mockResolvedValueOnce(makeMenu()) // existing menu
      .mockResolvedValueOnce(null);       // parent not found
    const cmd = new UpdateMenuCommand('menu-1', { parentId: 'nonexistent-parent' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException on circular reference', async () => {
    // menu-1 is parent of menu-2, we try to set menu-2 as parent of menu-1
    const menu1 = makeMenu({ id: 'menu-1', parentId: null });
    const menu2 = makeMenu({ id: 'menu-2', parentId: 'menu-1' });

    prisma.identity.menu.findUnique
      .mockResolvedValueOnce(menu1)                // find existing menu-1
      .mockResolvedValueOnce(menu2)                // find new parent (menu-2) — exists
      .mockResolvedValueOnce({ parentId: 'menu-1' }); // isDescendant: menu-2.parentId = menu-1 → circular!

    const cmd = new UpdateMenuCommand('menu-1', { parentId: 'menu-2' });
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.findUnique.mockRejectedValue(new Error('DB error'));
    const cmd = new UpdateMenuCommand('menu-1', { name: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// GetMenuByIdHandler
// ---------------------------------------------------------------------------

describe('GetMenuByIdHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetMenuByIdHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new GetMenuByIdHandler(prisma);
  });

  it('should return menu with parent and children', async () => {
    const menu = makeMenu({ parent: null, children: [] });
    prisma.identity.menu.findUnique.mockResolvedValue(menu);

    const result = await handler.execute(new GetMenuByIdQuery('menu-1'));
    expect(result).toEqual(menu);
    expect(prisma.identity.menu.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'menu-1' }, include: expect.any(Object) }),
    );
  });

  it('should throw NotFoundException when menu not found', async () => {
    prisma.identity.menu.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetMenuByIdQuery('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetMenuByIdQuery('menu-1'))).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// GetMenuTreeHandler
// ---------------------------------------------------------------------------

describe('GetMenuTreeHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let config: ReturnType<typeof buildConfig>;
  let handler: GetMenuTreeHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    config = buildConfig({ DEFAULT_TENANT_ID: 'tenant-default' });
    prisma.identity.menu.findMany.mockResolvedValue([makeMenu()]);
    handler = new GetMenuTreeHandler(prisma, config);
  });

  it('should return menu tree for tenant', async () => {
    const query = new GetMenuTreeQuery(true, 'tenant-1');
    const result = await handler.execute(query);
    expect(Array.isArray(result)).toBe(true);
    expect(prisma.identity.menu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ parentId: null, tenantId: 'tenant-1' }),
      }),
    );
  });

  it('should use DEFAULT_TENANT_ID for super admin', async () => {
    const query = new GetMenuTreeQuery(true, undefined, true);
    await handler.execute(query);
    expect(config.get).toHaveBeenCalledWith('DEFAULT_TENANT_ID');
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.findMany.mockRejectedValue(new Error('Tree failed'));
    await expect(handler.execute(new GetMenuTreeQuery(true, 'tenant-1'))).rejects.toThrow('Tree failed');
  });
});

// ---------------------------------------------------------------------------
// GetMyMenuHandler
// ---------------------------------------------------------------------------

describe('GetMyMenuHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let config: ReturnType<typeof buildConfig>;
  let handler: GetMyMenuHandler;

  const activeMenu = makeMenu({
    isActive: true,
    permissionModule: null,
    permissionAction: null,
    autoEnableWithModule: null,
    businessTypeApplicability: ['ALL'],
    requiresCredential: false,
  });

  beforeEach(() => {
    prisma = buildPrisma();
    config = buildConfig({ DEFAULT_TENANT_ID: 'tenant-default' });
    prisma.identity.menu.findMany.mockResolvedValue([activeMenu]);
    prisma.identity.rolePermission.findMany.mockResolvedValue([]);
    prisma.platform.tenantModule.findMany.mockResolvedValue([]);
    prisma.identity.terminologyOverride.findMany.mockResolvedValue([]);
    prisma.identity.tenant.findFirst.mockResolvedValue({ id: 'tenant-default' });
    handler = new GetMyMenuHandler(prisma, config);
  });

  it('should return menu tree for regular user', async () => {
    prisma.identity.tenant.findUnique = jest.fn().mockResolvedValue({ id: 'tenant-1', businessTypeId: null });
    const query = new GetMyMenuQuery('user-1', 'role-1', 'SALES', false, 'tenant-1', 'GENERAL');
    const result = await handler.execute(query);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return unfiltered tree for SUPER_ADMIN', async () => {
    const query = new GetMyMenuQuery('user-super', 'role-super', 'SUPER_ADMIN', true);
    const result = await handler.execute(query);
    expect(Array.isArray(result)).toBe(true);
    // Super admin loads from default tenant
    expect(config.get).toHaveBeenCalledWith('DEFAULT_TENANT_ID');
  });

  it('should filter menus that require missing permissions', async () => {
    const restrictedMenu = makeMenu({
      id: 'menu-restricted',
      code: 'RESTRICTED',
      permissionModule: 'billing',
      permissionAction: 'view',
    });
    prisma.identity.menu.findMany.mockResolvedValue([restrictedMenu]);
    prisma.identity.rolePermission.findMany.mockResolvedValue([]); // no permissions
    prisma.identity.tenant.findUnique = jest.fn().mockResolvedValue({ id: 'tenant-1', businessTypeId: null });

    const query = new GetMyMenuQuery('user-1', 'role-1', 'SALES', false, 'tenant-1');
    const result = await handler.execute(query);
    // Menu requiring billing:view should be hidden
    expect(result.every((m: any) => m.code !== 'RESTRICTED')).toBe(true);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.menu.findMany.mockRejectedValue(new Error('Menu load failed'));
    const query = new GetMyMenuQuery('user-1', 'role-1', 'SALES', false, 'tenant-1');
    await expect(handler.execute(query)).rejects.toThrow('Menu load failed');
  });
});
