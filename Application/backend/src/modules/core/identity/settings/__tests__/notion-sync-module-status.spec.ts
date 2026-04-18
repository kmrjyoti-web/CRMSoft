import { NotionSyncService } from '../services/notion-sync.service';

// Minimal mock of Notion client methods
const mockClient = {
  dataSources: {
    query: jest.fn(),
  },
  pages: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrisma = {
  notionConfig: {
    findUnique: jest.fn(),
  },
};

function buildService() {
  const svc = new NotionSyncService(mockPrisma as any);
  // Stub internal getClient to return our mock
  jest.spyOn(svc as any, 'getClient').mockResolvedValue(mockClient);
  return svc;
}

const MODULES = [
  { id: 'contacts', name: 'Contacts', category: 'CRM' },
  { id: 'invoicing', name: 'Invoicing', category: 'Finance' },
];

describe('NotionSyncService — module test status', () => {
  afterEach(() => jest.clearAllMocks());

  // ─── syncModuleTestStatus ───────────────────────────────────────────────────

  describe('syncModuleTestStatus', () => {
    it('throws when Notion database is not configured', async () => {
      mockPrisma.notionConfig.findUnique.mockResolvedValue(null);

      await expect(
        buildService().syncModuleTestStatus('t-1', 'contacts', 'Contacts', 'Done'),
      ).rejects.toThrow();
    });

    it('creates a new Notion page when module not yet synced', async () => {
      mockPrisma.notionConfig.findUnique.mockResolvedValue({
        tenantId: 't-1',
        databaseId: 'db-123',
        token: 'secret',
      });
      mockClient.dataSources.query.mockResolvedValue({ results: [] });
      mockClient.pages.create.mockResolvedValue({ id: 'page-new', url: 'https://notion.so/page-new' });

      const result = await buildService().syncModuleTestStatus('t-1', 'contacts', 'Contacts', 'In Progress', 'Testing started');

      expect(mockClient.pages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: { database_id: 'db-123' },
          properties: expect.objectContaining({
            'Status': { select: { name: 'In Progress' } },
            'Module ID': { rich_text: [{ text: { content: 'contacts' } }] },
          }),
        }),
      );
      expect(mockClient.pages.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'page-new', url: 'https://notion.so/page-new' });
    });

    it('updates existing Notion page when module already synced', async () => {
      mockPrisma.notionConfig.findUnique.mockResolvedValue({
        tenantId: 't-1',
        databaseId: 'db-123',
        token: 'secret',
      });
      mockClient.dataSources.query.mockResolvedValue({ results: [{ id: 'existing-page' }] });
      mockClient.pages.update.mockResolvedValue({ id: 'existing-page', url: 'https://notion.so/existing-page' });

      const result = await buildService().syncModuleTestStatus('t-1', 'invoicing', 'Invoicing', 'Done');

      expect(mockClient.pages.update).toHaveBeenCalledWith(
        expect.objectContaining({
          page_id: 'existing-page',
          properties: expect.objectContaining({
            'Status': { select: { name: 'Done' } },
          }),
        }),
      );
      expect(mockClient.pages.create).not.toHaveBeenCalled();
      expect(result.id).toBe('existing-page');
    });
  });

  // ─── listModuleTestStatuses ─────────────────────────────────────────────────

  describe('listModuleTestStatuses', () => {
    it('returns all modules as not_synced when no Notion config exists', async () => {
      mockPrisma.notionConfig.findUnique.mockResolvedValue(null);

      const result = await buildService().listModuleTestStatuses('t-1', MODULES);

      expect(result).toHaveLength(2);
      expect(result.every(r => r.syncState === 'not_synced')).toBe(true);
      expect(result.every(r => r.notionStatus === 'Not Started')).toBe(true);
    });

    it('merges Notion pages with local module list', async () => {
      mockPrisma.notionConfig.findUnique.mockResolvedValue({
        tenantId: 't-1',
        databaseId: 'db-123',
        token: 'secret',
      });
      mockClient.dataSources.query.mockResolvedValue({
        results: [
          {
            id: 'page-contacts',
            url: 'https://notion.so/page-contacts',
            last_edited_time: '2026-03-27T10:00:00.000Z',
            properties: {
              'Module ID': { rich_text: [{ plain_text: 'contacts' }] },
              'Status': { select: { name: 'Done' } },
            },
          },
        ],
      });

      const result = await buildService().listModuleTestStatuses('t-1', MODULES);

      const contacts = result.find(r => r.moduleId === 'contacts');
      expect(contacts?.syncState).toBe('synced');
      expect(contacts?.notionStatus).toBe('Done');
      expect(contacts?.notionPageId).toBe('page-contacts');

      const invoicing = result.find(r => r.moduleId === 'invoicing');
      expect(invoicing?.syncState).toBe('not_synced');
      expect(invoicing?.notionStatus).toBe('Not Started');
    });

    it('returns all modules as not_synced when Notion query fails', async () => {
      mockPrisma.notionConfig.findUnique.mockResolvedValue({
        tenantId: 't-1',
        databaseId: 'db-123',
        token: 'secret',
      });
      mockClient.dataSources.query.mockRejectedValue(new Error('Notion API error'));

      const result = await buildService().listModuleTestStatuses('t-1', MODULES);

      expect(result).toHaveLength(2);
      expect(result.every(r => r.syncState === 'not_synced')).toBe(true);
    });
  });
});
