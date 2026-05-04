import { CreateSavedFilterHandler } from '../application/commands/create-saved-filter/create-saved-filter.handler';
import { CreateSavedFilterCommand } from '../application/commands/create-saved-filter/create-saved-filter.command';
import { ListSavedFiltersHandler } from '../application/queries/list-saved-filters/list-saved-filters.handler';
import { ListSavedFiltersQuery } from '../application/queries/list-saved-filters/list-saved-filters.query';

const makeFilter = (overrides = {}) => ({
  id: 'sf-1',
  name: 'Open Leads',
  entityType: 'lead',
  filterConfig: { status: 'NEW' },
  isDefault: false,
  isShared: false,
  createdById: 'user-1',
  ...overrides,
});

describe('Saved Filters', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        savedFilter: {
          create: jest.fn(),
          updateMany: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      },
    };
  });

  afterEach(() => jest.clearAllMocks());

  // ─── CreateSavedFilterHandler ─────────────────────────────────────────────

  describe('CreateSavedFilterHandler', () => {
    let handler: CreateSavedFilterHandler;
    beforeEach(() => { handler = new CreateSavedFilterHandler(prisma); });

    it('should create a saved filter', async () => {
      prisma.working.savedFilter.create.mockResolvedValue(makeFilter());
      const cmd = new CreateSavedFilterCommand('Open Leads', 'lead', { status: 'NEW' }, 'user-1');
      const result = await handler.execute(cmd);
      expect(result).toMatchObject({ name: 'Open Leads', entityType: 'lead' });
      expect(prisma.working.savedFilter.create).toHaveBeenCalledTimes(1);
    });

    it('should unset previous defaults when isDefault=true', async () => {
      prisma.working.savedFilter.updateMany.mockResolvedValue({ count: 1 });
      prisma.working.savedFilter.create.mockResolvedValue(makeFilter({ isDefault: true }));
      const cmd = new CreateSavedFilterCommand('My Default', 'lead', {}, 'user-1', undefined, true);
      await handler.execute(cmd);
      expect(prisma.working.savedFilter.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ createdById: 'user-1', entityType: 'lead', isDefault: true }),
          data: { isDefault: false },
        }),
      );
    });

    it('should not call updateMany when isDefault=false', async () => {
      prisma.working.savedFilter.create.mockResolvedValue(makeFilter());
      const cmd = new CreateSavedFilterCommand('Shared Filter', 'lead', {}, 'user-1', undefined, false);
      await handler.execute(cmd);
      expect(prisma.working.savedFilter.updateMany).not.toHaveBeenCalled();
    });

    it('should create shared filter with roles', async () => {
      prisma.working.savedFilter.create.mockResolvedValue(makeFilter({ isShared: true }));
      const cmd = new CreateSavedFilterCommand('Team Filter', 'contact', {}, 'user-1', undefined, false, true, ['SALES_MANAGER']);
      await handler.execute(cmd);
      const data = prisma.working.savedFilter.create.mock.calls[0][0].data;
      expect(data.isShared).toBe(true);
      expect(data.sharedWithRoles).toContain('SALES_MANAGER');
    });

    it('should default isShared to false', async () => {
      prisma.working.savedFilter.create.mockResolvedValue(makeFilter());
      const cmd = new CreateSavedFilterCommand('Filter', 'lead', {}, 'user-1');
      await handler.execute(cmd);
      expect(prisma.working.savedFilter.create.mock.calls[0][0].data.isShared).toBe(false);
    });
  });

  // ─── ListSavedFiltersHandler ──────────────────────────────────────────────

  describe('ListSavedFiltersHandler', () => {
    let handler: ListSavedFiltersHandler;
    beforeEach(() => { handler = new ListSavedFiltersHandler(prisma); });

    it('should return paginated saved filters', async () => {
      prisma.working.savedFilter.findMany.mockResolvedValue([makeFilter()]);
      prisma.working.savedFilter.count.mockResolvedValue(1);
      const result = await handler.execute(new ListSavedFiltersQuery('user-1'));
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should include own and shared filters in query', async () => {
      prisma.working.savedFilter.findMany.mockResolvedValue([]);
      prisma.working.savedFilter.count.mockResolvedValue(0);
      await handler.execute(new ListSavedFiltersQuery('user-1'));
      const where = prisma.working.savedFilter.findMany.mock.calls[0][0].where;
      expect(where.OR).toEqual(expect.arrayContaining([
        { createdById: 'user-1' },
        { isShared: true },
      ]));
    });

    it('should filter by entityType when provided', async () => {
      prisma.working.savedFilter.findMany.mockResolvedValue([]);
      prisma.working.savedFilter.count.mockResolvedValue(0);
      await handler.execute(new ListSavedFiltersQuery('user-1', 'lead'));
      const where = prisma.working.savedFilter.findMany.mock.calls[0][0].where;
      expect(where.entityType).toBe('lead');
    });

    it('should filter by search name', async () => {
      prisma.working.savedFilter.findMany.mockResolvedValue([]);
      prisma.working.savedFilter.count.mockResolvedValue(0);
      await handler.execute(new ListSavedFiltersQuery('user-1', undefined, 'open'));
      const where = prisma.working.savedFilter.findMany.mock.calls[0][0].where;
      expect(where.name).toEqual(expect.objectContaining({ contains: 'open' }));
    });

    it('should return empty when user has no filters', async () => {
      prisma.working.savedFilter.findMany.mockResolvedValue([]);
      prisma.working.savedFilter.count.mockResolvedValue(0);
      const result = await handler.execute(new ListSavedFiltersQuery('user-999'));
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should clamp limit to max 100', async () => {
      prisma.working.savedFilter.findMany.mockResolvedValue([]);
      prisma.working.savedFilter.count.mockResolvedValue(0);
      await handler.execute(new ListSavedFiltersQuery('user-1', undefined, undefined, 1, 999));
      expect(prisma.working.savedFilter.findMany.mock.calls[0][0].take).toBe(100);
    });
  });
});
