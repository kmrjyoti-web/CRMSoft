import { GetCustomerMenuHandler } from '../application/queries/get-customer-menu/get-customer-menu.handler';
import { GetCustomerMenuQuery } from '../application/queries/get-customer-menu/get-customer-menu.query';
import { NotFoundException } from '@nestjs/common';
import { CustomerUserEntity } from '../domain/entities/customer-user.entity';
import { isOk } from '@/common/types';

const makeUser = async (overrides: { menuCategoryId?: string | null; pageOverrides?: Record<string, boolean> } = {}) => {
  const result = await CustomerUserEntity.create('user-1', 'tenant-1', {
    email: 'customer@example.com',
    password: 'SecurePass1',
    linkedEntityType: 'CONTACT',
    linkedEntityId: 'entity-1',
    linkedEntityName: 'Ravi Kumar',
    displayName: 'Ravi Kumar',
    isActive: true,
    createdById: 'admin-1',
  });
  expect(isOk(result)).toBe(true);
  if (!isOk(result)) throw new Error('Failed to create user');
  const user = result.data;
  if (overrides.menuCategoryId !== undefined) (user as any).props.menuCategoryId = overrides.menuCategoryId;
  if (overrides.pageOverrides) (user as any).props.pageOverrides = overrides.pageOverrides;
  return user;
};

describe('GetCustomerMenuHandler', () => {
  let handler: GetCustomerMenuHandler;
  let mockUserRepo: jest.Mocked<any>;
  let mockPrisma: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = {
      findById: jest.fn(),
    };
    mockPrisma = {
      identity: {
        customerMenuCategory: { findUnique: jest.fn() },
      },
    };
    handler = new GetCustomerMenuHandler(mockUserRepo, mockPrisma as any);
  });

  it('throws NotFoundException when customer not found', async () => {
    mockUserRepo.findById.mockResolvedValue(null);
    await expect(
      handler.execute(new GetCustomerMenuQuery('nonexistent')),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns empty menu when no category assigned', async () => {
    const user = await makeUser({ menuCategoryId: null });
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    expect(result.categoryName).toBeUndefined();
    expect(result.totalRoutes).toBe(0);
    expect(result.menu).toEqual([]);
    expect(mockPrisma.identity.customerMenuCategory.findUnique).not.toHaveBeenCalled();
  });

  it('returns category routes when category is assigned and has no overrides', async () => {
    const user = await makeUser({ menuCategoryId: 'cat-1' });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Basic Customer',
      enabledRoutes: ['/dashboard', '/invoices', '/payments'],
    });

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    expect(result.categoryName).toBe('Basic Customer');
    expect(result.totalRoutes).toBe(3);
    expect(result.menu.map((m: any) => m.route)).toEqual(['/dashboard', '/invoices', '/payments']);
  });

  it('hides routes blocked by pageOverrides', async () => {
    const user = await makeUser({
      menuCategoryId: 'cat-1',
      pageOverrides: { '/invoices': false },
    });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Premium',
      enabledRoutes: ['/dashboard', '/invoices', '/payments', '/ledger'],
    });

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    const routes = result.menu.map((m: any) => m.route);
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/payments');
    expect(routes).toContain('/ledger');
    expect(routes).not.toContain('/invoices');
    expect(result.totalRoutes).toBe(3);
  });

  it('enriches menu items with route metadata from CUSTOMER_PORTAL_ROUTES', async () => {
    const user = await makeUser({ menuCategoryId: 'cat-1' });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Basic',
      enabledRoutes: ['/dashboard'],
    });

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    const dashboardItem = result.menu[0];
    expect(dashboardItem.route).toBe('/dashboard');
    expect(dashboardItem.name).toBe('Dashboard');
    expect(dashboardItem.icon).toBeDefined();
    expect(dashboardItem.group).toBe('Main');
  });

  it('groups menu items by section', async () => {
    const user = await makeUser({ menuCategoryId: 'cat-1' });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Mixed',
      enabledRoutes: ['/dashboard', '/invoices', '/payments'],
    });

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    // /dashboard → Main group, /invoices + /payments → Finance group
    expect(result.menuGrouped['Main']).toBeDefined();
    expect(result.menuGrouped['Finance']).toBeDefined();
    expect(result.menuGrouped['Finance'].length).toBe(2);
  });

  it('falls back gracefully when category id set but category deleted from DB', async () => {
    const user = await makeUser({ menuCategoryId: 'deleted-cat' });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue(null);

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    expect(result.categoryName).toBeUndefined();
    expect(result.totalRoutes).toBe(0);
    expect(result.menu).toEqual([]);
  });

  it('returns pageOverrides in the response', async () => {
    const user = await makeUser({
      menuCategoryId: 'cat-1',
      pageOverrides: { '/ledger': false },
    });
    mockUserRepo.findById.mockResolvedValue(user);
    mockPrisma.identity.customerMenuCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      name: 'Basic',
      enabledRoutes: ['/dashboard', '/ledger'],
    });

    const result = await handler.execute(new GetCustomerMenuQuery('user-1'));

    expect(result.pageOverrides).toEqual({ '/ledger': false });
  });
});
