import { Test, TestingModule } from '@nestjs/testing';
import { ErrorCatalogService } from '../errors/error-catalog.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('ErrorCatalogService', () => {
  let service: ErrorCatalogService;

  const mockEntries = [
    {
      id: '1',
      code: 'INTERNAL_ERROR',
      layer: 'BE',
      module: 'SYSTEM',
      severity: 'CRITICAL',
      httpStatus: 500,
      messageEn: 'An unexpected internal error occurred',
      messageHi: 'एक अप्रत्याशित आंतरिक त्रुटि हुई',
      solutionEn: 'Contact support with the traceId.',
      solutionHi: 'traceId के साथ सहायता से संपर्क करें।',
      isActive: true,
    },
    {
      id: '2',
      code: 'AUTH_TOKEN_EXPIRED',
      layer: 'BE',
      module: 'AUTH',
      severity: 'WARNING',
      httpStatus: 401,
      messageEn: 'Authentication token has expired',
      messageHi: 'प्रमाणीकरण टोकन समाप्त हो गया है',
      solutionEn: 'Obtain a new token via POST /auth/login.',
      solutionHi: 'POST /auth/login के माध्यम से एक नया टोकन प्राप्त करें।',
      isActive: true,
    },
    {
      id: '3',
      code: 'DB_UNIQUE_CONSTRAINT',
      layer: 'DB',
      module: 'DATABASE',
      severity: 'WARNING',
      httpStatus: 409,
      messageEn: 'Unique constraint violation',
      messageHi: 'अद्वितीय बाधा उल्लंघन',
      solutionEn: 'Check for existing records.',
      solutionHi: 'मौजूदा रिकॉर्ड की जांच करें।',
      isActive: true,
    },
    {
      id: '4',
      code: 'FE_NETWORK_ERROR',
      layer: 'FE',
      module: 'FRONTEND',
      severity: 'ERROR',
      httpStatus: 0,
      messageEn: 'Network request failed',
      messageHi: 'नेटवर्क अनुरोध विफल',
      solutionEn: 'Check your internet connection.',
      solutionHi: 'अपना इंटरनेट कनेक्शन जांचें।',
      isActive: true,
    },
  ];

  const mockPrisma = {
    errorCatalog: {
      findMany: jest.fn().mockResolvedValue(mockEntries),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorCatalogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ErrorCatalogService);
    jest.clearAllMocks();
    mockPrisma.errorCatalog.findMany.mockResolvedValue(mockEntries);
  });

  it('should load cache on init', async () => {
    await service.onModuleInit();
    expect(mockPrisma.errorCatalog.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });

  it('should return entry by code', async () => {
    await service.onModuleInit();
    const entry = await service.getByCode('INTERNAL_ERROR');

    expect(entry).toBeDefined();
    expect(entry!.code).toBe('INTERNAL_ERROR');
    expect(entry!.layer).toBe('BE');
    expect(entry!.severity).toBe('CRITICAL');
    expect(entry!.messageEn).toContain('unexpected');
    expect(entry!.messageHi).toBeTruthy();
  });

  it('should return null for unknown code', async () => {
    await service.onModuleInit();
    const entry = await service.getByCode('NONEXISTENT_CODE');
    expect(entry).toBeNull();
  });

  it('should return all entries', async () => {
    await service.onModuleInit();
    const all = await service.getAll();
    expect(all).toHaveLength(4);
  });

  it('should filter by module', async () => {
    await service.onModuleInit();
    const authEntries = await service.getByModule('AUTH');
    expect(authEntries).toHaveLength(1);
    expect(authEntries[0].code).toBe('AUTH_TOKEN_EXPIRED');
  });

  it('should filter by layer', async () => {
    await service.onModuleInit();
    const dbEntries = await service.getByLayer('DB');
    expect(dbEntries).toHaveLength(1);
    expect(dbEntries[0].code).toBe('DB_UNIQUE_CONSTRAINT');
  });

  it('should refresh cache and return count', async () => {
    await service.onModuleInit();
    const count = await service.refreshCache();
    expect(count).toBe(4);
    expect(mockPrisma.errorCatalog.findMany).toHaveBeenCalledTimes(2); // init + refresh
  });

  it('should handle cache refresh failure gracefully', async () => {
    await service.onModuleInit();
    mockPrisma.errorCatalog.findMany.mockRejectedValueOnce(new Error('DB down'));

    const count = await service.refreshCache();
    // Should return existing cache size (4 from init)
    expect(count).toBe(4);
  });

  it('should auto-refresh when cache is stale', async () => {
    await service.onModuleInit();
    // Force cache to be stale by manipulating lastRefresh
    (service as any).lastRefresh = 0;

    await service.getByCode('INTERNAL_ERROR');
    // Should have called findMany again (init + auto-refresh)
    expect(mockPrisma.errorCatalog.findMany).toHaveBeenCalledTimes(2);
  });
});
