import { CreateMenuCategoryHandler } from '../application/commands/create-menu-category/create-menu-category.handler';
import { CreateMenuCategoryCommand } from '../application/commands/create-menu-category/create-menu-category.command';
import { UpdateMenuCategoryHandler } from '../application/commands/update-menu-category/update-menu-category.handler';
import { UpdateMenuCategoryCommand } from '../application/commands/update-menu-category/update-menu-category.command';
import { DeleteMenuCategoryHandler } from '../application/commands/delete-menu-category/delete-menu-category.handler';
import { DeleteMenuCategoryCommand } from '../application/commands/delete-menu-category/delete-menu-category.command';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const BASE_CATEGORY = {
  id: 'cat-1',
  tenantId: 'tenant-1',
  name: 'Basic Customer',
  enabledRoutes: ['/dashboard', '/invoices'],
  isDefault: false,
  isDeleted: false,
  _count: { users: 0 },
};

const makePrisma = () => ({
  identity: {
    customerMenuCategory: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
});

describe('CreateMenuCategoryHandler', () => {
  let handler: CreateMenuCategoryHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    handler = new CreateMenuCategoryHandler(mockPrisma as any);
  });

  it('creates a menu category successfully', async () => {
    const created = { ...BASE_CATEGORY, id: 'new-cat' };
    mockPrisma.identity.customerMenuCategory.create.mockResolvedValue(created);

    const result = await handler.execute(
      new CreateMenuCategoryCommand('tenant-1', 'admin-1', 'Basic Customer', ['/dashboard', '/invoices']),
    );

    expect(result.id).toBe('new-cat');
    expect(mockPrisma.identity.customerMenuCategory.create).toHaveBeenCalledTimes(1);
  });

  it('unsets existing default when isDefault=true', async () => {
    mockPrisma.identity.customerMenuCategory.create.mockResolvedValue(BASE_CATEGORY);

    await handler.execute(
      new CreateMenuCategoryCommand('tenant-1', 'admin-1', 'Basic Customer', ['/dashboard'], undefined, undefined, undefined, undefined, true),
    );

    expect(mockPrisma.identity.customerMenuCategory.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', isDefault: true },
      data: { isDefault: false },
    });
  });

  it('does NOT call updateMany when isDefault is false/undefined', async () => {
    mockPrisma.identity.customerMenuCategory.create.mockResolvedValue(BASE_CATEGORY);

    await handler.execute(
      new CreateMenuCategoryCommand('tenant-1', 'admin-1', 'Basic Customer', ['/dashboard']),
    );

    expect(mockPrisma.identity.customerMenuCategory.updateMany).not.toHaveBeenCalled();
  });

  it('throws ConflictException on unique constraint violation', async () => {
    mockPrisma.identity.customerMenuCategory.create.mockRejectedValue(
      new Error('Unique constraint failed'),
    );

    await expect(
      handler.execute(
        new CreateMenuCategoryCommand('tenant-1', 'admin-1', 'Basic Customer', ['/dashboard']),
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('re-throws non-conflict errors', async () => {
    mockPrisma.identity.customerMenuCategory.create.mockRejectedValue(
      new Error('Database connection lost'),
    );

    await expect(
      handler.execute(
        new CreateMenuCategoryCommand('tenant-1', 'admin-1', 'Basic Customer', ['/dashboard']),
      ),
    ).rejects.toThrow('Database connection lost');
  });
});

describe('UpdateMenuCategoryHandler', () => {
  let handler: UpdateMenuCategoryHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    handler = new UpdateMenuCategoryHandler(mockPrisma as any);
  });

  it('updates a category successfully', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(BASE_CATEGORY);
    const updated = { ...BASE_CATEGORY, name: 'Updated Name' };
    mockPrisma.identity.customerMenuCategory.update.mockResolvedValue(updated);

    const result = await handler.execute(
      new UpdateMenuCategoryCommand('cat-1', { name: 'Updated Name' }),
    );

    expect(result.name).toBe('Updated Name');
    expect(mockPrisma.identity.customerMenuCategory.update).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException when category does not exist', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateMenuCategoryCommand('nonexistent', { name: 'X' })),
    ).rejects.toThrow(NotFoundException);
  });

  it('unsets other defaults when setting isDefault=true', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(BASE_CATEGORY);
    mockPrisma.identity.customerMenuCategory.update.mockResolvedValue({ ...BASE_CATEGORY, isDefault: true });

    await handler.execute(
      new UpdateMenuCategoryCommand('cat-1', { isDefault: true }),
    );

    expect(mockPrisma.identity.customerMenuCategory.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', isDefault: true, id: { not: 'cat-1' } },
      data: { isDefault: false },
    });
  });

  it('does NOT call updateMany when isDefault not being changed', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(BASE_CATEGORY);
    mockPrisma.identity.customerMenuCategory.update.mockResolvedValue(BASE_CATEGORY);

    await handler.execute(
      new UpdateMenuCategoryCommand('cat-1', { name: 'New Name' }),
    );

    expect(mockPrisma.identity.customerMenuCategory.updateMany).not.toHaveBeenCalled();
  });
});

describe('DeleteMenuCategoryHandler', () => {
  let handler: DeleteMenuCategoryHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    handler = new DeleteMenuCategoryHandler(mockPrisma as any);
  });

  it('soft-deletes a category with no assigned users', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue({
      ...BASE_CATEGORY,
      _count: { users: 0 },
    });
    mockPrisma.identity.customerMenuCategory.update.mockResolvedValue({});

    const result = await handler.execute(new DeleteMenuCategoryCommand('cat-1'));

    expect(result.message).toBe('Menu category deleted');
    expect(mockPrisma.identity.customerMenuCategory.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: { isDeleted: true },
    });
  });

  it('throws NotFoundException when category does not exist', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new DeleteMenuCategoryCommand('nonexistent')),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when users are still assigned', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue({
      ...BASE_CATEGORY,
      _count: { users: 3 },
    });

    await expect(
      handler.execute(new DeleteMenuCategoryCommand('cat-1')),
    ).rejects.toThrow(BadRequestException);
  });

  it('includes assigned user count in BadRequestException message', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue({
      ...BASE_CATEGORY,
      _count: { users: 5 },
    });

    await expect(
      handler.execute(new DeleteMenuCategoryCommand('cat-1')),
    ).rejects.toThrow('5 portal user(s)');
  });

  it('does NOT call update when deletion is blocked', async () => {
    mockPrisma.identity.customerMenuCategory.findFirst.mockResolvedValue({
      ...BASE_CATEGORY,
      _count: { users: 1 },
    });

    await expect(
      handler.execute(new DeleteMenuCategoryCommand('cat-1')),
    ).rejects.toThrow(BadRequestException);

    expect(mockPrisma.identity.customerMenuCategory.update).not.toHaveBeenCalled();
  });
});
