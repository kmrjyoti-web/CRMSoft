import { HelpService } from '../services/help.service';
import { helpSeedData } from '../services/help-seed-data';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ───

const mockPrisma = {
  helpArticle: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
} as any;

describe('HelpService', () => {
  let service: HelpService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HelpService(mockPrisma);
  });

  // ─── listArticles ───

  it('should list articles with pagination', async () => {
    const articles = [{ id: '1', title: 'Test' }];
    mockPrisma.helpArticle.findMany.mockResolvedValue(articles);
    mockPrisma.helpArticle.count.mockResolvedValue(1);

    const result = await service.listArticles({ page: 1, limit: 10 });
    expect(result.data).toEqual(articles);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should filter by helpType', async () => {
    mockPrisma.helpArticle.findMany.mockResolvedValue([]);
    mockPrisma.helpArticle.count.mockResolvedValue(0);

    await service.listArticles({ helpType: 'USER' });
    expect(mockPrisma.helpArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ helpType: 'USER' }) }),
    );
  });

  it('should filter by moduleCode and screenCode', async () => {
    mockPrisma.helpArticle.findMany.mockResolvedValue([]);
    mockPrisma.helpArticle.count.mockResolvedValue(0);

    await service.listArticles({ moduleCode: 'CONTACTS', screenCode: 'CONTACT_LIST' });
    expect(mockPrisma.helpArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ moduleCode: 'CONTACTS', screenCode: 'CONTACT_LIST' }),
      }),
    );
  });

  it('should apply search filter across title, summary, content', async () => {
    mockPrisma.helpArticle.findMany.mockResolvedValue([]);
    mockPrisma.helpArticle.count.mockResolvedValue(0);

    await service.listArticles({ search: 'quotation' });
    expect(mockPrisma.helpArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'quotation', mode: 'insensitive' } },
            { summary: { contains: 'quotation', mode: 'insensitive' } },
            { content: { contains: 'quotation', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  // ─── getByCode ───

  it('should get article by code and increment viewCount', async () => {
    const article = { id: '1', articleCode: 'USER_ADD_CONTACTS', viewCount: 5 };
    mockPrisma.helpArticle.findUnique.mockResolvedValue(article);
    mockPrisma.helpArticle.update.mockResolvedValue({ ...article, viewCount: 6 });

    const result = await service.getByCode('USER_ADD_CONTACTS');
    expect(result.viewCount).toBe(6);
    expect(mockPrisma.helpArticle.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { viewCount: { increment: 1 } },
    });
  });

  it('should throw NotFoundException for unknown article code', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
    await expect(service.getByCode('NOPE')).rejects.toThrow(NotFoundException);
  });

  // ─── getContextual ───

  it('should return contextual articles for module/screen', async () => {
    const articles = [{ id: '1', title: 'Help' }];
    mockPrisma.helpArticle.findMany.mockResolvedValue(articles);

    const result = await service.getContextual('CONTACTS', 'CONTACT_LIST');
    expect(result).toEqual(articles);
    expect(mockPrisma.helpArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          helpType: 'USER',
          isPublished: true,
          moduleCode: 'CONTACTS',
          screenCode: 'CONTACT_LIST',
        }),
      }),
    );
  });

  it('should include fieldCode filter when provided', async () => {
    mockPrisma.helpArticle.findMany.mockResolvedValue([]);
    await service.getContextual('CONTACTS', 'CONTACT_FORM', 'EMAIL');
    expect(mockPrisma.helpArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ fieldCode: 'EMAIL' }),
      }),
    );
  });

  // ─── create ───

  it('should create a new article with defaults', async () => {
    const input = {
      articleCode: 'NEW_ARTICLE',
      title: 'Test',
      content: 'Content here',
      summary: 'Summary',
      helpType: 'USER' as const,
    };
    mockPrisma.helpArticle.create.mockResolvedValue({ id: '1', ...input });

    const result = await service.create(input);
    expect(result.articleCode).toBe('NEW_ARTICLE');
    expect(mockPrisma.helpArticle.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        articleCode: 'NEW_ARTICLE',
        applicableTypes: ['ALL'],
        usesTerminology: false,
        relatedArticles: [],
        visibleToRoles: ['ALL'],
        tags: [],
        isPublished: false,
      }),
    });
  });

  // ─── update ───

  it('should update an existing article', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue({ id: '1' });
    mockPrisma.helpArticle.update.mockResolvedValue({ id: '1', title: 'Updated' });

    const result = await service.update('1', { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('should throw NotFoundException on update if not found', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
    await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
  });

  // ─── markHelpful / markNotHelpful ───

  it('should increment helpfulCount', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue({ id: '1', helpfulCount: 3 });
    mockPrisma.helpArticle.update.mockResolvedValue({ id: '1', helpfulCount: 4 });

    const result = await service.markHelpful('1');
    expect(result.helpfulCount).toBe(4);
    expect(mockPrisma.helpArticle.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { helpfulCount: { increment: 1 } },
    });
  });

  it('should increment notHelpfulCount', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue({ id: '1', notHelpfulCount: 1 });
    mockPrisma.helpArticle.update.mockResolvedValue({ id: '1', notHelpfulCount: 2 });

    const result = await service.markNotHelpful('1');
    expect(result.notHelpfulCount).toBe(2);
  });

  it('should throw NotFoundException on markHelpful if not found', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
    await expect(service.markHelpful('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException on markNotHelpful if not found', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
    await expect(service.markNotHelpful('bad-id')).rejects.toThrow(NotFoundException);
  });

  // ─── resolveTerminology ───

  it('should replace terminology placeholders', () => {
    const content = 'Welcome to {product}! Manage your {contact}s and {organization}s.';
    const map = { product: 'MyCRM', contact: 'Customer', organization: 'Company' };

    const result = service.resolveTerminology(content, map);
    expect(result).toBe('Welcome to MyCRM! Manage your Customers and Companys.');
  });

  it('should be case-insensitive for placeholders', () => {
    const content = '{Product} helps you manage {CONTACT}s';
    const map = { product: 'CRM', contact: 'Lead' };

    const result = service.resolveTerminology(content, map);
    expect(result).toBe('CRM helps you manage Leads');
  });

  it('should leave unknown placeholders unchanged', () => {
    const content = 'Hello {unknown} world';
    const result = service.resolveTerminology(content, { product: 'CRM' });
    expect(result).toBe('Hello {unknown} world');
  });

  // ─── seedDefaults ───

  it('should seed default articles (create new)', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue(null);
    mockPrisma.helpArticle.create.mockImplementation(async ({ data }: any) => data);

    const result = await service.seedDefaults();
    expect(result.seeded).toBe(helpSeedData.length);
    expect(result.results.every((r: any) => r.action === 'created')).toBe(true);
    expect(mockPrisma.helpArticle.create).toHaveBeenCalledTimes(helpSeedData.length);
  });

  it('should update existing articles on re-seed', async () => {
    mockPrisma.helpArticle.findUnique.mockResolvedValue({ id: '1' });
    mockPrisma.helpArticle.update.mockImplementation(async ({ data }: any) => data);

    const result = await service.seedDefaults();
    expect(result.seeded).toBe(helpSeedData.length);
    expect(result.results.every((r: any) => r.action === 'updated')).toBe(true);
    expect(mockPrisma.helpArticle.update).toHaveBeenCalledTimes(helpSeedData.length);
  });

  // ─── seed data validation ───

  it('should have 10 seed articles (5 USER + 5 DEVELOPER)', () => {
    expect(helpSeedData).toHaveLength(10);
    const userArticles = helpSeedData.filter((a) => a.helpType === 'USER');
    const devArticles = helpSeedData.filter((a) => a.helpType === 'DEVELOPER');
    expect(userArticles).toHaveLength(5);
    expect(devArticles).toHaveLength(5);
  });

  it('should have unique articleCodes in seed data', () => {
    const codes = helpSeedData.map((a) => a.articleCode);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('should have terminology placeholders in relevant seed articles', () => {
    const terminologyArticles = helpSeedData.filter((a) => a.usesTerminology);
    expect(terminologyArticles.length).toBeGreaterThan(0);
    for (const article of terminologyArticles) {
      const hasPlaceholder = /\{(product|contact|organization)\}/i.test(article.content);
      expect(hasPlaceholder).toBe(true);
    }
  });
});
