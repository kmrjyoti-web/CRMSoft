import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class UnitConverterService {
  async convert(
    prisma: PrismaService,
    params: {
      productId: string;
      quantity: number;
      fromUnit: string;
      toUnit: string;
    },
  ): Promise<{ quantity: number; unit: string; conversionRate: number }> {
    const { productId, quantity, fromUnit, toUnit } = params;

    if (fromUnit === toUnit) {
      return { quantity, unit: toUnit, conversionRate: 1 };
    }

    // 1. Try direct conversion (fromUnit -> toUnit)
    const direct = await prisma.productUnitConversion.findFirst({
      where: {
        productId,
        fromUnit: fromUnit as any,
        toUnit: toUnit as any,
      },
    });

    if (direct) {
      const rate = Number(direct.conversionRate);
      return { quantity: quantity * rate, unit: toUnit, conversionRate: rate };
    }

    // 2. Try reverse conversion (toUnit -> fromUnit)
    const reverse = await prisma.productUnitConversion.findFirst({
      where: {
        productId,
        fromUnit: toUnit as any,
        toUnit: fromUnit as any,
      },
    });

    if (reverse) {
      const rate = 1 / Number(reverse.conversionRate);
      return { quantity: quantity * rate, unit: toUnit, conversionRate: rate };
    }

    // 3. Try chaining through an intermediate unit
    const allConversions = await prisma.productUnitConversion.findMany({
      where: { productId },
    });

    for (const c1 of allConversions) {
      const from1 = String(c1.fromUnit);
      const to1 = String(c1.toUnit);
      const rate1 = Number(c1.conversionRate);

      let intermediateUnit: string | null = null;
      let firstRate = 0;

      // fromUnit -> intermediate
      if (from1 === fromUnit) {
        intermediateUnit = to1;
        firstRate = rate1;
      } else if (to1 === fromUnit) {
        intermediateUnit = from1;
        firstRate = 1 / rate1;
      } else {
        continue;
      }

      // intermediate -> toUnit
      for (const c2 of allConversions) {
        const from2 = String(c2.fromUnit);
        const to2 = String(c2.toUnit);
        const rate2 = Number(c2.conversionRate);

        let secondRate = 0;
        if (from2 === intermediateUnit && to2 === toUnit) {
          secondRate = rate2;
        } else if (to2 === intermediateUnit && from2 === toUnit) {
          secondRate = 1 / rate2;
        } else {
          continue;
        }

        const combinedRate = firstRate * secondRate;
        return {
          quantity: quantity * combinedRate,
          unit: toUnit,
          conversionRate: combinedRate,
        };
      }
    }

    throw new NotFoundException('No conversion path found');
  }
}
