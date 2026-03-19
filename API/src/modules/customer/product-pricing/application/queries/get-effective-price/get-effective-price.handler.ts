import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetEffectivePriceQuery } from './get-effective-price.query';
import { calculateTax, toNum, round } from './tax-calculator.helper';

@QueryHandler(GetEffectivePriceQuery)
export class GetEffectivePriceHandler
  implements IQueryHandler<GetEffectivePriceQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEffectivePriceQuery) {
    const { productId, contactId, organizationId, quantity, isInterState } =
      query;

    // 1. Load product
    const product = await this.prisma.working.product.findUnique({
      where: { id: productId },
      select: {
        id: true, name: true, gstRate: true, cessRate: true,
        taxType: true, taxInclusive: true, salePrice: true, mrp: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product "${productId}" not found`);
    }

    // 2-3. Resolve price group from contact or organization
    const priceGroupId = await this.resolvePriceGroup(
      contactId, organizationId,
    );

    // 4. Load active prices
    const now = new Date();
    const allPrices = await this.prisma.working.productPrice.findMany({
      where: { productId, isActive: true },
      include: {
        priceGroup: { select: { id: true, name: true, priority: true } },
      },
      orderBy: [{ priceType: 'asc' }, { minQty: 'asc' }],
    });

    // 5. Filter by validity window
    const validPrices = allPrices.filter((p) => {
      if (p.validFrom && new Date(p.validFrom) > now) return false;
      if (p.validTo && new Date(p.validTo) < now) return false;
      return true;
    });

    // 6-8. Resolve effective price with priority
    const resolved = this.resolvePrice(validPrices, priceGroupId, quantity, product);

    // 9-10. Calculate tax and build response
    const gstRate = toNum(product.gstRate ?? 0);
    const cessRate = toNum(product.cessRate ?? 0);

    const { baseAmount, unitTotal, tax } = calculateTax({
      basePrice: resolved.price,
      gstRate,
      cessRate,
      taxType: product.taxType as string,
      taxInclusive: product.taxInclusive ?? false,
      isInterState,
      quantity,
    });

    return {
      productId: product.id,
      productName: product.name,
      basePrice: round(baseAmount),
      priceType: resolved.priceType,
      priceGroup: resolved.groupName,
      quantity,
      slabApplied: resolved.slabApplied,
      subtotal: round(baseAmount * quantity),
      tax,
      grandTotal: round(unitTotal * quantity),
      currency: 'INR',
    };
  }

  private async resolvePriceGroup(
    contactId?: string,
    organizationId?: string,
  ): Promise<string | null> {
    if (contactId) {
      const mapping = await this.prisma.working.customerGroupMapping.findFirst({
        where: { contactId, isActive: true },
        include: {
          priceGroup: { select: { id: true, priority: true } },
        },
        orderBy: { priceGroup: { priority: 'desc' } },
      });
      if (mapping) return mapping.priceGroupId;
    }

    if (organizationId) {
      const mapping = await this.prisma.working.customerGroupMapping.findFirst({
        where: { organizationId, isActive: true },
        include: {
          priceGroup: { select: { id: true, priority: true } },
        },
        orderBy: { priceGroup: { priority: 'desc' } },
      });
      if (mapping) return mapping.priceGroupId;
    }

    return null;
  }

  private resolvePrice(
    prices: any[], priceGroupId: string | null,
    qty: number, product: any,
  ) {
    const groupPrices = priceGroupId
      ? prices.filter((p) => p.priceGroupId === priceGroupId)
      : [];
    const basePrices = prices.filter((p) => !p.priceGroupId);

    // Priority 1: Group + slab
    const groupSlab = this.findSlabMatch(groupPrices, qty);
    if (groupSlab) {
      return {
        price: toNum(groupSlab.amount),
        priceType: groupSlab.priceType,
        groupName: groupSlab.priceGroup?.name ?? null,
        slabApplied: {
          minQty: toNum(groupSlab.minQty),
          maxQty: groupSlab.maxQty ? toNum(groupSlab.maxQty) : null,
        },
      };
    }

    // Priority 2: Group base price
    const groupBase = this.findBasePrice(groupPrices);
    if (groupBase) {
      return {
        price: toNum(groupBase.amount),
        priceType: groupBase.priceType,
        groupName: groupBase.priceGroup?.name ?? null,
        slabApplied: null,
      };
    }

    // Priority 3: Default slab
    const defaultSlab = this.findSlabMatch(basePrices, qty);
    if (defaultSlab) {
      return {
        price: toNum(defaultSlab.amount),
        priceType: defaultSlab.priceType,
        groupName: null,
        slabApplied: {
          minQty: toNum(defaultSlab.minQty),
          maxQty: defaultSlab.maxQty ? toNum(defaultSlab.maxQty) : null,
        },
      };
    }

    // Priority 4: SALE_PRICE > MRP > product fallback
    const sale = basePrices.find((p) => p.priceType === 'SALE_PRICE' && !p.minQty);
    if (sale) return { price: toNum(sale.amount), priceType: 'SALE_PRICE', groupName: null, slabApplied: null };

    const mrp = basePrices.find((p) => p.priceType === 'MRP' && !p.minQty);
    if (mrp) return { price: toNum(mrp.amount), priceType: 'MRP', groupName: null, slabApplied: null };

    const fallback = product.salePrice ?? product.mrp ?? 0;
    return {
      price: toNum(fallback),
      priceType: product.salePrice ? 'SALE_PRICE' : 'MRP',
      groupName: null,
      slabApplied: null,
    };
  }

  private findSlabMatch(prices: any[], qty: number) {
    const slabs = prices.filter((p) => p.minQty != null && toNum(p.minQty) > 0);
    return slabs.find((s) => {
      const min = toNum(s.minQty);
      const max = s.maxQty ? toNum(s.maxQty) : null;
      return min <= qty && (max === null || max >= qty);
    });
  }

  private findBasePrice(prices: any[]) {
    const base = prices.filter((p) => !p.minQty || toNum(p.minQty) === 0);
    return (
      base.find((p) => p.priceType === 'SALE_PRICE') ??
      base.find((p) => p.priceType === 'DEALER_PRICE') ??
      base.find((p) => p.priceType === 'DISTRIBUTOR_PRICE') ??
      base[0] ?? null
    );
  }
}
