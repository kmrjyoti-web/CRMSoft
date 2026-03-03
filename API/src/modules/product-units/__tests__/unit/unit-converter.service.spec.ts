import { UnitConverterService } from '../../services/unit-converter.service';
import { NotFoundException } from '@nestjs/common';

describe('UnitConverterService', () => {
  let service: UnitConverterService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      productUnitConversion: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new UnitConverterService();
  });

  it('should convert using direct conversion', async () => {
    prisma.productUnitConversion.findFirst.mockResolvedValueOnce({
      productId: 'p1',
      fromUnit: 'BOX',
      toUnit: 'PIECE',
      conversionRate: 12,
    });

    const result = await service.convert(prisma, {
      productId: 'p1',
      quantity: 5,
      fromUnit: 'BOX',
      toUnit: 'PIECE',
    });

    expect(result).toEqual({
      quantity: 60,
      unit: 'PIECE',
      conversionRate: 12,
    });
  });

  it('should convert using reverse conversion', async () => {
    // First call (direct lookup) returns null
    prisma.productUnitConversion.findFirst
      .mockResolvedValueOnce(null)
      // Second call (reverse lookup) returns the BOX->PIECE record
      .mockResolvedValueOnce({
        productId: 'p1',
        fromUnit: 'BOX',
        toUnit: 'PIECE',
        conversionRate: 12,
      });

    const result = await service.convert(prisma, {
      productId: 'p1',
      quantity: 60,
      fromUnit: 'PIECE',
      toUnit: 'BOX',
    });

    expect(result.unit).toBe('BOX');
    expect(result.conversionRate).toBeCloseTo(1 / 12);
    expect(result.quantity).toBeCloseTo(60 / 12);
  });

  it('should throw NotFoundException when no conversion path exists', async () => {
    prisma.productUnitConversion.findFirst.mockResolvedValue(null);
    prisma.productUnitConversion.findMany.mockResolvedValue([]);

    await expect(
      service.convert(prisma, {
        productId: 'p1',
        quantity: 10,
        fromUnit: 'KG',
        toUnit: 'LITRE',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
