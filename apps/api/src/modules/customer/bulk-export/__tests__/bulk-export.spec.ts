import { ExportService } from '../services/export.service';
import { ExportController } from '../presentation/export.controller';

// ── ExportService ──────────────────────────────────────────────────────────

describe('ExportService', () => {
  let prisma: any;
  let service: ExportService;

  beforeEach(() => {
    prisma = {
      exportJob: {
        create: jest.fn().mockResolvedValue({
          id: 'job-1', targetEntity: 'LEAD', format: 'xlsx', status: 'PROCESSING',
          createdById: 'user-1', createdByName: 'Raj Patel',
        }),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'job-1', fileUrl: '/exports/export-job1.xlsx' }),
      },
      contact: { findMany: jest.fn().mockResolvedValue([]) },
      organization: { findMany: jest.fn().mockResolvedValue([]) },
      lead: { findMany: jest.fn().mockResolvedValue([]) },
      product: { findMany: jest.fn().mockResolvedValue([]) },
    };
    prisma.working = prisma;
    service = new ExportService(prisma);
  });

  it('creates an export job and returns immediately', async () => {
    const result = await service.createExport({
      targetEntity: 'LEAD', format: 'xlsx', filters: {}, columns: [],
      createdById: 'user-1', createdByName: 'Raj Patel',
    });
    expect(prisma.exportJob.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ targetEntity: 'LEAD', format: 'xlsx' }) }),
    );
    expect(result.id).toBe('job-1');
  });

  it('generates template buffer for CONTACT entity', async () => {
    const buffer = await service.generateTemplate('CONTACT');
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('generates template buffer for LEAD entity', async () => {
    const buffer = await service.generateTemplate('LEAD');
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it('generates template buffer for unknown entity (no columns)', async () => {
    const buffer = await service.generateTemplate('UNKNOWN_ENTITY');
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});

// ── ExportController ───────────────────────────────────────────────────────

describe('ExportController', () => {
  let exportService: any;
  let prisma: any;
  let controller: ExportController;
  const user = { id: 'user-1', firstName: 'Raj', lastName: 'Patel', tenantId: 't-1' };

  beforeEach(() => {
    prisma = {
      exportJob: {
        findMany: jest.fn().mockResolvedValue([{ id: 'job-1' }]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    prisma.working = prisma;
    exportService = {
      createExport: jest.fn().mockResolvedValue({ id: 'job-1', status: 'PROCESSING' }),
      generateTemplate: jest.fn().mockResolvedValue(Buffer.from('xlsx')),
    };
    controller = new ExportController(exportService as any, prisma);
  });

  it('creates export job via service', async () => {
    const result = await controller.create({ targetEntity: 'LEAD', format: 'xlsx' } as any, user);
    expect(exportService.createExport).toHaveBeenCalledWith(
      expect.objectContaining({ targetEntity: 'LEAD', createdById: 'user-1' }),
    );
    expect(result.data).toEqual({ id: 'job-1', status: 'PROCESSING' });
  });

  it('lists export jobs with pagination', async () => {
    const result = await controller.list({ page: '1', limit: '20' });
    expect(result.meta!.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });
});
