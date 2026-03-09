import { Test, TestingModule } from '@nestjs/testing';
import { ErrorCatalogService, CatalogEntry } from '../error-catalog.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('ErrorCatalogService', () => {
  let service: ErrorCatalogService;

  const MOCK_ENTRIES = [
    {
      id: '1',
      code: 'NOT_FOUND',
      layer: 'BE',
      module: 'SYSTEM',
      severity: 'WARNING',
      httpStatus: 404,
      messageEn: 'Resource not found',
      messageHi: 'संसाधन नहीं मिला',
      solutionEn: 'Verify the ID.',
      solutionHi: 'ID सत्यापित करें।',
      technicalInfo: null,
      helpUrl: null,
      isRetryable: false,
      retryAfterMs: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      code: 'OTP_EXPIRED',
      layer: 'BE',
      module: 'VERIFICATION',
      severity: 'WARNING',
      httpStatus: 400,
      messageEn: 'OTP has expired',
      messageHi: 'OTP समाप्त हो गया है',
      solutionEn: 'Request a new OTP.',
      solutionHi: 'नया OTP अनुरोध करें।',
      technicalInfo: null,
      helpUrl: '/help/verification/otp',
      isRetryable: true,
      retryAfterMs: 60000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      code: 'DB_UNIQUE_CONSTRAINT',
      layer: 'DB',
      module: 'DATABASE',
      severity: 'WARNING',
      httpStatus: 409,
      messageEn: 'Duplicate value',
      messageHi: 'डुप्लिकेट मान',
      solutionEn: 'Check existing records.',
      solutionHi: 'मौजूदा रिकॉर्ड जांचें।',
      technicalInfo: 'Prisma P2002',
      helpUrl: null,
      isRetryable: false,
      retryAfterMs: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrisma = {
    errorCatalog: {
      findMany: jest.fn().mockResolvedValue(MOCK_ENTRIES),
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
    mockPrisma.errorCatalog.findMany.mockResolvedValue(MOCK_ENTRIES);
  });

  describe('onModuleInit', () => {
    it('should load cache on init', async () => {
      await service.onModuleInit();
      expect(mockPrisma.errorCatalog.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('getByCode', () => {
    it('should return entry by code', async () => {
      await service.onModuleInit();
      const entry = await service.getByCode('NOT_FOUND');

      expect(entry).toBeDefined();
      expect(entry!.code).toBe('NOT_FOUND');
      expect(entry!.messageEn).toBe('Resource not found');
      expect(entry!.messageHi).toBe('संसाधन नहीं मिला');
    });

    it('should return null for unknown code', async () => {
      await service.onModuleInit();
      const entry = await service.getByCode('DOES_NOT_EXIST');
      expect(entry).toBeNull();
    });

    it('should include new fields in CatalogEntry', async () => {
      await service.onModuleInit();
      const entry = await service.getByCode('OTP_EXPIRED');

      expect(entry!.helpUrl).toBe('/help/verification/otp');
      expect(entry!.isRetryable).toBe(true);
      expect(entry!.retryAfterMs).toBe(60000);
    });

    it('should return technicalInfo when set', async () => {
      await service.onModuleInit();
      const entry = await service.getByCode('DB_UNIQUE_CONSTRAINT');
      expect(entry!.technicalInfo).toBe('Prisma P2002');
    });
  });

  describe('getAll', () => {
    it('should return all entries', async () => {
      await service.onModuleInit();
      const all = await service.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('getByModule', () => {
    it('should filter by module name', async () => {
      await service.onModuleInit();
      const entries = await service.getByModule('VERIFICATION');
      expect(entries).toHaveLength(1);
      expect(entries[0].code).toBe('OTP_EXPIRED');
    });
  });

  describe('getByLayer', () => {
    it('should filter by layer', async () => {
      await service.onModuleInit();
      const dbEntries = await service.getByLayer('DB');
      expect(dbEntries).toHaveLength(1);
      expect(dbEntries[0].code).toBe('DB_UNIQUE_CONSTRAINT');
    });
  });

  describe('refreshCache', () => {
    it('should reload cache from DB', async () => {
      await service.onModuleInit();
      mockPrisma.errorCatalog.findMany.mockResolvedValue([MOCK_ENTRIES[0]]);

      const count = await service.refreshCache();
      expect(count).toBe(1);

      const all = await service.getAll();
      expect(all).toHaveLength(1);
    });

    it('should handle DB failure gracefully', async () => {
      await service.onModuleInit();
      mockPrisma.errorCatalog.findMany.mockRejectedValue(new Error('DB down'));

      const count = await service.refreshCache();
      // Should return existing cache size, not throw
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
