import { Test, TestingModule } from '@nestjs/testing';
import { TerminologyService } from '../services/terminology.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TerminologyService', () => {
  let service: TerminologyService;

  const mockPrisma = {
    tenant: { findUnique: jest.fn() },
    terminologyOverride: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminologyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(TerminologyService);
    jest.clearAllMocks();
  });

  describe('getResolved', () => {
    it('should merge business type terms with tenant overrides', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 't1',
        businessType: {
          terminologyMap: { Product: 'Service', Contact: 'Client' },
        },
      });
      mockPrisma.terminologyOverride.findMany.mockResolvedValue([
        { termKey: 'Product', customLabel: 'Solution' },
      ]);

      const result = await service.getResolved('t1');

      expect(result.Product).toBe('Solution'); // override wins
      expect(result.Contact).toBe('Client'); // default preserved
    });

    it('should return empty map for tenant without business type', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 't1',
        businessType: null,
      });
      mockPrisma.terminologyOverride.findMany.mockResolvedValue([]);

      const result = await service.getResolved('t1');

      expect(result).toEqual({});
    });

    it('should throw NotFoundException for invalid tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getResolved('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should upsert a terminology override', async () => {
      const data = {
        termKey: 'Product',
        defaultLabel: 'Product',
        customLabel: 'Service',
      };
      mockPrisma.terminologyOverride.upsert.mockResolvedValue({ id: '1', ...data });

      const result = await service.upsert('t1', data);

      expect(mockPrisma.terminologyOverride.upsert).toHaveBeenCalledWith({
        where: {
          tenantId_termKey_scope: { tenantId: 't1', termKey: 'Product', scope: 'GLOBAL' },
        },
        update: expect.objectContaining({ customLabel: 'Service' }),
        create: expect.objectContaining({ tenantId: 't1', termKey: 'Product', customLabel: 'Service' }),
      });
    });

    it('should use custom scope if provided', async () => {
      const data = {
        termKey: 'Product',
        defaultLabel: 'Product',
        customLabel: 'Service',
        scope: 'MODULE:LEADS',
      };
      mockPrisma.terminologyOverride.upsert.mockResolvedValue({ id: '1', ...data });

      await service.upsert('t1', data);

      expect(mockPrisma.terminologyOverride.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId_termKey_scope: { tenantId: 't1', termKey: 'Product', scope: 'MODULE:LEADS' },
          },
        }),
      );
    });
  });

  describe('bulkUpsert', () => {
    it('should upsert multiple items', async () => {
      const items = [
        { termKey: 'Product', defaultLabel: 'Product', customLabel: 'Service' },
        { termKey: 'Contact', defaultLabel: 'Contact', customLabel: 'Client' },
      ];
      mockPrisma.terminologyOverride.upsert.mockResolvedValue({ id: '1' });

      const result = await service.bulkUpsert('t1', items);

      expect(result).toHaveLength(2);
      expect(mockPrisma.terminologyOverride.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should delete an override', async () => {
      mockPrisma.terminologyOverride.delete.mockResolvedValue({ id: '1' });

      await service.remove('t1', 'Product');

      expect(mockPrisma.terminologyOverride.delete).toHaveBeenCalledWith({
        where: {
          tenantId_termKey_scope: { tenantId: 't1', termKey: 'Product', scope: 'GLOBAL' },
        },
      });
    });
  });
});
