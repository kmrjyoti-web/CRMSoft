import { Test, TestingModule } from '@nestjs/testing';
import { BusinessTypeService } from '../services/business-type.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { BUSINESS_TYPE_SEED_DATA } from '../services/business-type-seed-data';

describe('BusinessTypeService', () => {
  let service: BusinessTypeService;
  let prisma: PrismaService;

  const mockPrisma = {
    businessTypeRegistry: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    terminologyOverride: {
      findMany: jest.fn(),
    },
  };
(mockPrisma as any).platform = mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessTypeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(BusinessTypeService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('seed', () => {
    it('should upsert all 15 business types', async () => {
      mockPrisma.businessTypeRegistry.upsert.mockResolvedValue({ id: '1' });

      const result = await service.seed();

      expect(result).toHaveLength(BUSINESS_TYPE_SEED_DATA.length);
      expect(mockPrisma.businessTypeRegistry.upsert).toHaveBeenCalledTimes(
        BUSINESS_TYPE_SEED_DATA.length,
      );
    });

    it('should use typeCode as upsert key', async () => {
      mockPrisma.businessTypeRegistry.upsert.mockResolvedValue({ id: '1' });

      await service.seed();

      const firstCall = mockPrisma.businessTypeRegistry.upsert.mock.calls[0][0];
      expect(firstCall.where).toEqual({ typeCode: 'GENERAL_TRADING' });
    });
  });

  describe('listAll', () => {
    it('should list only active types by default', async () => {
      mockPrisma.businessTypeRegistry.findMany.mockResolvedValue([]);

      await service.listAll();

      expect(mockPrisma.businessTypeRegistry.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should list all types when activeOnly=false', async () => {
      mockPrisma.businessTypeRegistry.findMany.mockResolvedValue([]);

      await service.listAll(false);

      expect(mockPrisma.businessTypeRegistry.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getByCode', () => {
    it('should return business type by code', async () => {
      const bt = { id: '1', typeCode: 'IT_SERVICES', typeName: 'IT / Software Services' };
      mockPrisma.businessTypeRegistry.findUnique.mockResolvedValue(bt);

      const result = await service.getByCode('IT_SERVICES');

      expect(result).toEqual(bt);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.businessTypeRegistry.findUnique.mockResolvedValue(null);

      await expect(service.getByCode('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resolveProfile', () => {
    it('should merge business type defaults with tenant overrides', async () => {
      const tenant = { id: 't1', businessTypeId: 'bt1', tradeProfileJson: { gst: '123' } };
      const bt = {
        id: 'bt1',
        typeCode: 'IT_SERVICES',
        typeName: 'IT / Software Services',
        industryCategory: 'SERVICES',
        icon: 'monitor',
        colorTheme: '#6366F1',
        terminologyMap: { Product: 'Service', Quotation: 'Proposal' },
        defaultModules: ['CONTACTS', 'LEADS'],
        recommendedModules: ['WHATSAPP'],
        excludedModules: [],
        dashboardWidgets: ['revenue_chart'],
        workflowTemplates: ['lead_to_proposal'],
      };
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
      mockPrisma.businessTypeRegistry.findUnique.mockResolvedValue(bt);
      mockPrisma.terminologyOverride.findMany.mockResolvedValue([
        { termKey: 'Product', customLabel: 'Solution' },
      ]);

      const result = await service.resolveProfile('t1');

      expect(result.terminology.Product).toBe('Solution'); // override wins
      expect(result.terminology.Quotation).toBe('Proposal'); // business type default
      expect(result.businessType?.typeCode).toBe('IT_SERVICES');
      expect(result.defaultModules).toEqual(['CONTACTS', 'LEADS']);
      expect(result.tradeProfile).toEqual({ gst: '123' });
    });

    it('should return empty profile for tenant without business type', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 't1',
        tradeProfileJson: null,
        businessType: null,
      });
      mockPrisma.terminologyOverride.findMany.mockResolvedValue([]);

      const result = await service.resolveProfile('t1');

      expect(result.businessType).toBeNull();
      expect(result.terminology).toEqual({});
      expect(result.defaultModules).toEqual([]);
    });

    it('should throw NotFoundException for invalid tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.resolveProfile('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignToTenant', () => {
    it('should assign business type to tenant', async () => {
      const bt = { id: 'bt1', typeCode: 'IT_SERVICES' };
      mockPrisma.businessTypeRegistry.findUnique.mockResolvedValue(bt);
      mockPrisma.tenant.update.mockResolvedValue({ id: 't1', businessTypeId: 'bt1' });

      const result = await service.assignToTenant('t1', 'IT_SERVICES');

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { businessTypeId: 'bt1' },
      });
      expect(result.businessTypeId).toBe('bt1');
    });
  });

  describe('updateTradeProfile', () => {
    it('should update trade profile JSON', async () => {
      const profile = { gst: 'GST123', pan: 'PAN456' };
      mockPrisma.tenant.update.mockResolvedValue({ id: 't1', tradeProfileJson: profile });

      const result = await service.updateTradeProfile('t1', profile);

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { tradeProfileJson: profile },
      });
    });
  });
});
