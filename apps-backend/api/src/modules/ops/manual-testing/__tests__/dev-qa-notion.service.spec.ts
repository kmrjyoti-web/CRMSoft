import { NotFoundException } from '@nestjs/common';
import { DevQANotionService } from '../services/dev-qa-notion.service';

// ─── Notion client mock ───────────────────────────────────────────────────────
const mockNotionPages = {
  create: jest.fn(),
  update: jest.fn(),
  retrieve: jest.fn(),
};
const mockNotionDatabases = {
  create: jest.fn(),
};
const mockNotionSearch = jest.fn();

jest.mock('@notionhq/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    pages: mockNotionPages,
    databases: mockNotionDatabases,
    search: mockNotionSearch,
  })),
}));

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const mockPrisma = {
  platform: {
    testPlan: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    testPlanItem: {
      createMany: jest.fn(),
      update: jest.fn(),
    },
    pageRegistry: {
      findMany: jest.fn(),
    },
  },
  notionConfig: {
    findUnique: jest.fn(),
  },
};

// ─── Test data helpers ────────────────────────────────────────────────────────
const makePlan = (overrides: Record<string, any> = {}) => ({
  id: 'plan-1',
  tenantId: 'tenant-1',
  name: 'My QA Plan',
  notionPageId: null,
  items: [],
  ...overrides,
});

const makeItem = (overrides: Record<string, any> = {}) => ({
  id: 'item-1',
  moduleName: 'leads',
  componentName: 'LeadsController',
  functionality: 'Create leads',
  layer: 'API',
  status: 'NOT_STARTED',
  priority: 'HIGH',
  notes: null,
  notionBlockId: null,
  ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────

describe('DevQANotionService', () => {
  let service: DevQANotionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DevQANotionService(mockPrisma as any);
  });

  // ─── generateModuleTestPlan ───────────────────────────────────────────────

  describe('generateModuleTestPlan', () => {
    beforeEach(() => {
      // No page registry entries — falls through to default module list
      mockPrisma.platform.pageRegistry.findMany.mockResolvedValue([]);
      mockPrisma.platform.testPlan.create.mockResolvedValue({ id: 'plan-1' });
      mockPrisma.platform.testPlanItem.createMany.mockResolvedValue({ count: 0 });
      mockPrisma.platform.testPlan.update.mockResolvedValue({});
    });

    it('creates a TestPlan with correct metadata', async () => {
      const result = await service.generateModuleTestPlan('Sprint QA', ['leads', 'contacts'], 'user-1', 'tenant-1');

      expect(mockPrisma.platform.testPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Sprint QA',
          tenantId: 'tenant-1',
          createdById: 'user-1',
          status: 'ACTIVE',
          targetModules: ['leads', 'contacts'],
        }),
      });
      expect(result.planId).toBe('plan-1');
    });

    it('generates multiple items per module (API CRUD + DB + auth)', async () => {
      const result = await service.generateModuleTestPlan('Plan A', ['leads'], 'u-1', 'tenant-1');

      // Each module: 5 CRUD + 1 DB + 1 auth = 7 items minimum
      expect(result.itemCount).toBeGreaterThanOrEqual(7);
    });

    it('uses all 15 default modules when moduleNames is undefined', async () => {
      const result = await service.generateModuleTestPlan('Full Plan', undefined, 'u-1', 'tenant-1');

      // 15 modules × (5 CRUD + 1 DB + 1 auth) = 105 items minimum
      expect(result.itemCount).toBeGreaterThanOrEqual(105);
    });

    it('includes page registry items when pages exist', async () => {
      mockPrisma.platform.pageRegistry.findMany.mockResolvedValue([
        { moduleCode: 'leads', componentName: 'LeadsList', friendlyName: null, routePath: '/leads' },
        { moduleCode: 'leads', componentName: 'LeadDetail', friendlyName: null, routePath: '/leads/:id' },
      ]);

      const result = await service.generateModuleTestPlan('UI Plan', ['leads'], 'u-1', 'tenant-1');

      // Should include the 2 UI items plus the API/DB items
      expect(result.itemCount).toBeGreaterThanOrEqual(9);
    });

    it('de-duplicates items with the same module:component:functionality key', async () => {
      // Two identical page registry entries
      mockPrisma.platform.pageRegistry.findMany.mockResolvedValue([
        { moduleCode: 'leads', componentName: 'LeadsList', friendlyName: null, routePath: '/leads' },
        { moduleCode: 'leads', componentName: 'LeadsList', friendlyName: null, routePath: '/leads' },
      ]);

      const result = await service.generateModuleTestPlan('Dup Plan', ['leads'], 'u-1', 'tenant-1');

      // Should only have 1 UI item (duplicates removed), plus API/DB items
      const createManyCall = mockPrisma.platform.testPlanItem.createMany.mock.calls[0][0].data;
      const uiItems = createManyCall.filter((i: any) => i.layer === 'UI' && i.componentName === 'LeadsList');
      expect(uiItems).toHaveLength(1);
    });

    it('updates plan totalItems after creating items', async () => {
      await service.generateModuleTestPlan('Plan', ['leads'], 'u-1', 'tenant-1');

      expect(mockPrisma.platform.testPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: expect.objectContaining({ totalItems: expect.any(Number) }),
      });
    });
  });

  // ─── syncToNotion ─────────────────────────────────────────────────────────

  describe('syncToNotion', () => {
    beforeEach(() => {
      mockNotionSearch.mockResolvedValue({ results: [] });
      mockNotionDatabases.create.mockResolvedValue({ id: 'notion-db-1' });
      mockNotionPages.create.mockResolvedValue({ id: 'notion-page-1' });
      mockNotionPages.update.mockResolvedValue({});
    });

    it('throws NotFoundException when plan not found', async () => {
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(null);
      await expect(service.syncToNotion('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });

    it('throws when Notion config is not set and NOTION_API_KEY is missing', async () => {
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(makePlan({ items: [] }));
      mockPrisma.notionConfig.findUnique.mockResolvedValue(null);
      const origKey = process.env.NOTION_API_KEY;
      delete process.env.NOTION_API_KEY;

      await expect(service.syncToNotion('plan-1', 'tenant-1')).rejects.toThrow(/Notion API key not configured/i);
      process.env.NOTION_API_KEY = origKey;
    });

    it('creates new Notion pages for items without notionBlockId', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'parent-page-id';
      mockPrisma.notionConfig.findUnique.mockResolvedValue(null);
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({ items: [makeItem({ notionBlockId: null })] }),
      );
      mockPrisma.platform.testPlanItem.update.mockResolvedValue({});
      mockPrisma.platform.testPlan.update.mockResolvedValue({});

      const result = await service.syncToNotion('plan-1', 'tenant-1');

      expect(mockNotionPages.create).toHaveBeenCalledTimes(1);
      expect(mockNotionPages.update).not.toHaveBeenCalled();
      expect(result.syncedCount).toBe(1);
    });

    it('updates existing Notion pages for items with notionBlockId', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'db-1' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({ items: [makeItem({ notionBlockId: 'notion-page-1' })] }),
      );
      mockPrisma.platform.testPlan.update.mockResolvedValue({});

      const result = await service.syncToNotion('plan-1', 'tenant-1');

      expect(mockNotionPages.update).toHaveBeenCalledWith(
        expect.objectContaining({ page_id: 'notion-page-1' }),
      );
      expect(mockNotionPages.create).not.toHaveBeenCalled();
      expect(result.syncedCount).toBe(1);
    });

    it('stores notionBlockId on item after creating Notion page', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'parent-page-id';
      mockPrisma.notionConfig.findUnique.mockResolvedValue(null);
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({ items: [makeItem({ id: 'item-99', notionBlockId: null })] }),
      );
      mockPrisma.platform.testPlanItem.update.mockResolvedValue({});
      mockPrisma.platform.testPlan.update.mockResolvedValue({});

      await service.syncToNotion('plan-1', 'tenant-1');

      expect(mockPrisma.platform.testPlanItem.update).toHaveBeenCalledWith({
        where: { id: 'item-99' },
        data: { notionBlockId: 'notion-page-1' },
      });
    });

    it('updates plan with notionPageId after sync', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'db-999' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(makePlan({ items: [] }));
      mockPrisma.platform.testPlan.update.mockResolvedValue({});

      await service.syncToNotion('plan-1', 'tenant-1');

      expect(mockPrisma.platform.testPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: expect.objectContaining({ notionPageId: 'db-999', notionSyncedAt: expect.any(Date) }),
      });
    });

    it('uses configured databaseId without searching Notion', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'existing-db' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(makePlan({ items: [] }));
      mockPrisma.platform.testPlan.update.mockResolvedValue({});

      await service.syncToNotion('plan-1', 'tenant-1');

      expect(mockNotionSearch).not.toHaveBeenCalled();
      expect(mockNotionDatabases.create).not.toHaveBeenCalled();
    });
  });

  // ─── pullFromNotion ───────────────────────────────────────────────────────

  describe('pullFromNotion', () => {
    it('throws NotFoundException when plan not found', async () => {
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(null);
      await expect(service.pullFromNotion('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });

    it('returns updated:0 when plan has no notionPageId', async () => {
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(makePlan({ notionPageId: null }));
      const result = await service.pullFromNotion('plan-1', 'tenant-1');
      expect(result.updated).toBe(0);
    });

    it('skips items without notionBlockId', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'db-1' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({
          notionPageId: 'notion-db',
          items: [],  // items where notionBlockId not null — empty here
        }),
      );

      const result = await service.pullFromNotion('plan-1', 'tenant-1');

      expect(mockNotionPages.retrieve).not.toHaveBeenCalled();
      expect(result.updated).toBe(0);
    });

    it('updates local status when Notion has different status', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'db-1' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({
          notionPageId: 'notion-db',
          items: [makeItem({ id: 'item-1', notionBlockId: 'notion-p-1', status: 'NOT_STARTED' })],
        }),
      );
      mockNotionPages.retrieve.mockResolvedValue({
        properties: {
          Status: { select: { name: 'PASSED' } },
          Notes: { rich_text: [] },
        },
      });
      mockPrisma.platform.testPlanItem.update.mockResolvedValue({});

      const result = await service.pullFromNotion('plan-1', 'tenant-1');

      expect(mockPrisma.platform.testPlanItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: expect.objectContaining({ status: 'PASSED' }),
      });
      expect(result.updated).toBe(1);
    });

    it('does not update item when Notion status matches local', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'db-1' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({
          notionPageId: 'notion-db',
          items: [makeItem({ id: 'item-1', notionBlockId: 'notion-p-1', status: 'PASSED', notes: 'ok' })],
        }),
      );
      mockNotionPages.retrieve.mockResolvedValue({
        properties: {
          Status: { select: { name: 'PASSED' } },
          Notes: { rich_text: [{ plain_text: 'ok' }] },
        },
      });

      const result = await service.pullFromNotion('plan-1', 'tenant-1');

      expect(mockPrisma.platform.testPlanItem.update).not.toHaveBeenCalled();
      expect(result.updated).toBe(0);
    });

    it('updates notes when Notion notes differ from local', async () => {
      process.env.NOTION_API_KEY = 'test-key';
      mockPrisma.notionConfig.findUnique.mockResolvedValue({ token: 'tok', databaseId: 'db-1' });
      mockPrisma.platform.testPlan.findFirst.mockResolvedValue(
        makePlan({
          notionPageId: 'notion-db',
          items: [makeItem({ id: 'item-2', notionBlockId: 'notion-p-2', status: 'NOT_STARTED', notes: null })],
        }),
      );
      mockNotionPages.retrieve.mockResolvedValue({
        properties: {
          Status: { select: { name: 'NOT_STARTED' } },
          Notes: { rich_text: [{ plain_text: 'Important note from Notion' }] },
        },
      });
      mockPrisma.platform.testPlanItem.update.mockResolvedValue({});

      const result = await service.pullFromNotion('plan-1', 'tenant-1');

      expect(mockPrisma.platform.testPlanItem.update).toHaveBeenCalledWith({
        where: { id: 'item-2' },
        data: expect.objectContaining({ notes: 'Important note from Notion' }),
      });
      expect(result.updated).toBe(1);
    });
  });
});
