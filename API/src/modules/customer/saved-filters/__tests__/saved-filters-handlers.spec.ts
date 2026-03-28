import { NotFoundException } from '@nestjs/common';
import { CreateSavedFilterHandler } from '../application/commands/create-saved-filter/create-saved-filter.handler';
import { UpdateSavedFilterHandler } from '../application/commands/update-saved-filter/update-saved-filter.handler';
import { DeleteSavedFilterHandler } from '../application/commands/delete-saved-filter/delete-saved-filter.handler';
import { ListSavedFiltersHandler } from '../application/queries/list-saved-filters/list-saved-filters.handler';
import { GetSavedFilterHandler } from '../application/queries/get-saved-filter/get-saved-filter.handler';
import { CreateSavedFilterCommand } from '../application/commands/create-saved-filter/create-saved-filter.command';
import { UpdateSavedFilterCommand } from '../application/commands/update-saved-filter/update-saved-filter.command';
import { DeleteSavedFilterCommand } from '../application/commands/delete-saved-filter/delete-saved-filter.command';
import { ListSavedFiltersQuery } from '../application/queries/list-saved-filters/list-saved-filters.query';
import { GetSavedFilterQuery } from '../application/queries/get-saved-filter/get-saved-filter.query';
import { SavedFiltersController } from '../presentation/saved-filters.controller';

const mockFilter = {
  id: 'filter-1',
  name: 'Active Leads',
  entityType: 'LEAD',
  filterConfig: { status: 'ACTIVE' },
  description: 'Shows all active leads',
  isDefault: false,
  isShared: false,
  sharedWithRoles: [],
  usageCount: 5,
  lastUsedAt: new Date('2026-03-01'),
  createdById: 'user-1',
  isDeleted: false,
  createdAt: new Date('2026-01-01'),
};

describe('SavedFilters Handlers', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        savedFilter: {
          create: jest.fn().mockResolvedValue(mockFilter),
          update: jest.fn().mockResolvedValue(mockFilter),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          findMany: jest.fn().mockResolvedValue([mockFilter]),
          findFirst: jest.fn().mockResolvedValue(mockFilter),
          count: jest.fn().mockResolvedValue(1),
        },
      },
    };
  });

  // ─── CreateSavedFilterHandler ──────────────────────────────────────────────

  describe('CreateSavedFilterHandler', () => {
    it('should create filter and clear existing defaults when isDefault is true', async () => {
      const defaultFilter = { ...mockFilter, isDefault: true };
      prisma.working.savedFilter.create.mockResolvedValue(defaultFilter);
      const handler = new CreateSavedFilterHandler(prisma);
      const cmd = new CreateSavedFilterCommand(
        'Active Leads',
        'LEAD',
        { status: 'ACTIVE' },
        'user-1',
        'Shows all active leads',
        true,
        false,
        [],
      );

      const result = await handler.execute(cmd);

      expect(prisma.working.savedFilter.updateMany).toHaveBeenCalledWith({
        where: {
          createdById: 'user-1',
          entityType: 'LEAD',
          isDefault: true,
          isDeleted: false,
        },
        data: { isDefault: false },
      });
      expect(prisma.working.savedFilter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Active Leads',
            entityType: 'LEAD',
            filterConfig: { status: 'ACTIVE' },
            isDefault: true,
            createdById: 'user-1',
          }),
        }),
      );
      expect(result.isDefault).toBe(true);
    });

    it('should create filter without clearing defaults when isDefault is false', async () => {
      const handler = new CreateSavedFilterHandler(prisma);
      const cmd = new CreateSavedFilterCommand(
        'Inactive Leads',
        'LEAD',
        { status: 'INACTIVE' },
        'user-1',
        undefined,
        false,
      );

      const result = await handler.execute(cmd);

      expect(prisma.working.savedFilter.updateMany).not.toHaveBeenCalled();
      expect(prisma.working.savedFilter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Inactive Leads',
            isDefault: false,
          }),
        }),
      );
      expect(result.id).toBe('filter-1');
    });
  });

  // ─── UpdateSavedFilterHandler ──────────────────────────────────────────────

  describe('UpdateSavedFilterHandler', () => {
    it('should update filter when it exists', async () => {
      const updatedFilter = { ...mockFilter, name: 'Hot Leads' };
      prisma.working.savedFilter.update.mockResolvedValue(updatedFilter);
      const handler = new UpdateSavedFilterHandler(prisma);
      const cmd = new UpdateSavedFilterCommand('filter-1', 'user-1', { name: 'Hot Leads' });

      const result = await handler.execute(cmd);

      expect(prisma.working.savedFilter.findFirst).toHaveBeenCalledWith({
        where: { id: 'filter-1', isDeleted: false },
      });
      expect(prisma.working.savedFilter.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'filter-1' } }),
      );
      expect(result.name).toBe('Hot Leads');
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      prisma.working.savedFilter.findFirst.mockResolvedValue(null);
      const handler = new UpdateSavedFilterHandler(prisma);
      const cmd = new UpdateSavedFilterCommand('nonexistent', 'user-1', { name: 'Ghost Filter' });

      await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── DeleteSavedFilterHandler ──────────────────────────────────────────────

  describe('DeleteSavedFilterHandler', () => {
    it('should soft delete filter by setting isDeleted: true and deletedAt', async () => {
      const deletedFilter = { ...mockFilter, isDeleted: true, deletedAt: new Date() };
      prisma.working.savedFilter.update.mockResolvedValue(deletedFilter);
      const handler = new DeleteSavedFilterHandler(prisma);
      const cmd = new DeleteSavedFilterCommand('filter-1', 'user-1');

      const result = await handler.execute(cmd);

      expect(prisma.working.savedFilter.findFirst).toHaveBeenCalledWith({
        where: { id: 'filter-1', isDeleted: false },
      });
      expect(prisma.working.savedFilter.update).toHaveBeenCalledWith({
        where: { id: 'filter-1' },
        data: { isDeleted: true, deletedAt: expect.any(Date) },
      });
      expect(result.isDeleted).toBe(true);
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      prisma.working.savedFilter.findFirst.mockResolvedValue(null);
      const handler = new DeleteSavedFilterHandler(prisma);
      const cmd = new DeleteSavedFilterCommand('nonexistent', 'user-1');

      await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── ListSavedFiltersHandler ───────────────────────────────────────────────

  describe('ListSavedFiltersHandler', () => {
    it('should return own and shared filters with pagination', async () => {
      const sharedFilter = { ...mockFilter, id: 'filter-2', isShared: true, createdById: 'user-99' };
      prisma.working.savedFilter.findMany.mockResolvedValue([mockFilter, sharedFilter]);
      prisma.working.savedFilter.count.mockResolvedValue(2);
      const handler = new ListSavedFiltersHandler(prisma);
      const query = new ListSavedFiltersQuery('user-1', undefined, undefined, 1, 50);

      const result = await handler.execute(query);

      expect(prisma.working.savedFilter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            OR: [{ createdById: 'user-1' }, { isShared: true }],
          }),
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should apply entityType filter when provided', async () => {
      const handler = new ListSavedFiltersHandler(prisma);
      const query = new ListSavedFiltersQuery('user-1', 'LEAD', undefined, 1, 50);

      await handler.execute(query);

      expect(prisma.working.savedFilter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'LEAD' }),
        }),
      );
    });
  });

  // ─── GetSavedFilterHandler ─────────────────────────────────────────────────

  describe('GetSavedFilterHandler', () => {
    it('should return filter and increment usageCount', async () => {
      const handler = new GetSavedFilterHandler(prisma);
      const query = new GetSavedFilterQuery('filter-1');

      const result = await handler.execute(query);

      expect(prisma.working.savedFilter.findFirst).toHaveBeenCalledWith({
        where: { id: 'filter-1', isDeleted: false },
      });
      expect(prisma.working.savedFilter.update).toHaveBeenCalledWith({
        where: { id: 'filter-1' },
        data: { usageCount: { increment: 1 }, lastUsedAt: expect.any(Date) },
      });
      expect(result.id).toBe('filter-1');
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      prisma.working.savedFilter.findFirst.mockResolvedValue(null);
      const handler = new GetSavedFilterHandler(prisma);
      const query = new GetSavedFilterQuery('nonexistent');

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });
  });
});

// ─── SavedFiltersController ───────────────────────────────────────────────────

describe('SavedFiltersController', () => {
  let controller: SavedFiltersController;
  let mockCommandBus: { execute: jest.Mock };
  let mockQueryBus: { execute: jest.Mock };

  const mockFilter = {
    id: 'filter-1',
    name: 'Active Leads',
    entityType: 'LEAD',
    filterConfig: { status: 'ACTIVE' },
    isDefault: false,
    isShared: false,
    createdById: 'user-1',
    isDeleted: false,
  };

  beforeEach(() => {
    mockCommandBus = { execute: jest.fn() };
    mockQueryBus = { execute: jest.fn() };
    controller = new SavedFiltersController(mockCommandBus as any, mockQueryBus as any);
  });

  it('should dispatch ListSavedFiltersQuery with userId from token on list', async () => {
    mockQueryBus.execute.mockResolvedValue({ data: [mockFilter], total: 1, page: 1, limit: 50 });
    const query = { entityType: 'LEAD', page: 1, limit: 50 } as any;

    const result = await controller.list(query, 'user-1');

    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', entityType: 'LEAD' }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should dispatch CreateSavedFilterCommand on create', async () => {
    mockCommandBus.execute.mockResolvedValue(mockFilter);
    const dto = {
      name: 'Active Leads',
      entityType: 'LEAD',
      filterConfig: { status: 'ACTIVE' },
      description: 'Shows active leads',
      isDefault: false,
      isShared: false,
      sharedWithRoles: [],
    } as any;

    const result = await controller.create(dto, 'user-1');

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Active Leads',
        entityType: 'LEAD',
        filterConfig: { status: 'ACTIVE' },
        createdById: 'user-1',
      }),
    );
    expect(result.message).toBe('Filter saved');
    expect(result.data.id).toBe('filter-1');
  });

  it('should dispatch UpdateSavedFilterCommand on update', async () => {
    const updatedFilter = { ...mockFilter, name: 'Hot Leads' };
    mockCommandBus.execute.mockResolvedValue(updatedFilter);
    const dto = { name: 'Hot Leads' } as any;

    const result = await controller.update('filter-1', dto, 'user-1');

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'filter-1', userId: 'user-1' }),
    );
    expect(result.message).toBe('Filter updated');
  });

  it('should dispatch DeleteSavedFilterCommand on delete', async () => {
    const deletedFilter = { ...mockFilter, isDeleted: true };
    mockCommandBus.execute.mockResolvedValue(deletedFilter);

    const result = await controller.remove('filter-1', 'user-1');

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'filter-1', userId: 'user-1' }),
    );
    expect(result.message).toBe('Filter deleted');
  });
});
