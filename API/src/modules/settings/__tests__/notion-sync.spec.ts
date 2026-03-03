import { NotionSyncService } from '../services/notion-sync.service';

// Mock @notionhq/client
jest.mock('@notionhq/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    users: {
      me: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Test User' }),
    },
    search: jest.fn().mockResolvedValue({
      results: [
        { id: 'db-1', title: [{ plain_text: 'Dev Sessions' }] },
        { id: 'db-2', title: [{ plain_text: 'Tasks' }] },
      ],
    }),
    pages: {
      create: jest.fn().mockResolvedValue({ id: 'page-1', url: 'https://notion.so/page-1' }),
    },
    dataSources: {
      query: jest.fn().mockResolvedValue({
        results: [
          {
            id: 'page-1',
            url: 'https://notion.so/page-1',
            properties: {
              'Prompt': { title: [{ plain_text: 'P16' }] },
              'Title': { rich_text: [{ plain_text: 'Notion Integration' }] },
              'Description': { rich_text: [{ plain_text: 'Added Notion sync' }] },
              'Status': { select: { name: 'Completed' } },
              'Date': { date: { start: '2026-03-03' } },
              'Files Changed': { rich_text: [{ plain_text: '8 files' }] },
              'Test Results': { rich_text: [{ plain_text: '373 tests pass' }] },
            },
          },
        ],
      }),
    },
  })),
}));

const mockPrisma = {
  notionConfig: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
} as any;

describe('NotionSyncService', () => {
  let service: NotionSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotionSyncService(mockPrisma);
  });

  it('should return null when no config exists', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue(null);
    const result = await service.getConfig('t1');
    expect(result).toBeNull();
  });

  it('should return masked token in config', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue({
      id: 'cfg-1',
      tenantId: 't1',
      token: 'ntn_abcdefghijklmnop',
      databaseId: 'db-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.getConfig('t1');
    expect(result).not.toBeNull();
    expect(result!.tokenMasked).toContain('ntn_abcd');
    expect(result!.tokenMasked).toContain('****');
    expect(result!.databaseId).toBe('db-1');
  });

  it('should upsert config on save', async () => {
    const saved = { id: 'cfg-1', tenantId: 't1', token: 'ntn_xxx', databaseId: 'db-1' };
    mockPrisma.notionConfig.upsert.mockResolvedValue(saved);

    const result = await service.saveConfig('t1', 'ntn_xxx', 'db-1', 'user-1');
    expect(mockPrisma.notionConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1' },
      }),
    );
    expect(result.token).toBe('ntn_xxx');
  });

  it('should test connection successfully', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue({
      token: 'ntn_valid_token',
    });

    const result = await service.testConnection('t1');
    expect(result.success).toBe(true);
    expect(result.user).toBe('Test User');
  });

  it('should list databases', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue({
      token: 'ntn_valid_token',
    });

    const result = await service.listDatabases('t1');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Dev Sessions');
    expect(result[1].id).toBe('db-2');
  });

  it('should create an entry in Notion database', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue({
      token: 'ntn_valid_token',
      databaseId: 'db-1',
    });

    const result = await service.createEntry('t1', {
      promptNumber: 'P16',
      title: 'Notion Integration',
      description: 'Full Notion sync',
      status: 'Completed',
      filesChanged: '8 files',
      testResults: '373 tests',
    });

    expect(result.id).toBe('page-1');
    expect(result.url).toBe('https://notion.so/page-1');
  });

  it('should list entries from Notion database', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue({
      token: 'ntn_valid_token',
      databaseId: 'db-1',
    });

    const result = await service.listEntries('t1');
    expect(result).toHaveLength(1);
    expect(result[0].promptNumber).toBe('P16');
    expect(result[0].title).toBe('Notion Integration');
    expect(result[0].status).toBe('Completed');
    expect(result[0].date).toBe('2026-03-03');
  });

  it('should return empty array when no database is set for entries', async () => {
    mockPrisma.notionConfig.findUnique.mockResolvedValue({
      token: 'ntn_valid_token',
      databaseId: null,
    });

    const result = await service.listEntries('t1');
    expect(result).toEqual([]);
  });
});
