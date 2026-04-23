import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

class Decimal {
  private val: number;
  constructor(v: number | string | { toNumber?: () => number }) {
    if (typeof v === 'object' && v !== null && typeof (v as any).toNumber === 'function') {
      this.val = (v as any).toNumber();
    } else {
      this.val = Number(v);
    }
  }
  lessThan(other: any): boolean { return this.val < new Decimal(other).val; }
  minus(other: any): Decimal { return new Decimal(this.val - new Decimal(other).val); }
  toNumber(): number { return this.val; }
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async listServices() {
    return this.prisma.servicePricingTier.findMany({ where: { isActive: true }, orderBy: { serviceName: 'asc' } });
  }

  async createService(dto: any) {
    return this.prisma.servicePricingTier.create({ data: dto });
  }

  async updateService(serviceCode: string, dto: any) {
    return this.prisma.servicePricingTier.update({ where: { serviceCode }, data: dto });
  }

  async getPartnerPricing(partnerId: string) {
    return this.prisma.partnerServicePricing.findMany({
      where: { partnerId },
      include: { service: true },
    });
  }

  async setPartnerPricing(dto: { partnerId: string; serviceCode: string; pricePerUnit: number; customerMinPrice?: number; customerSuggestedPrice?: number }) {
    const service = await this.prisma.servicePricingTier.findUnique({ where: { serviceCode: dto.serviceCode } });
    if (!service) throw new NotFoundException('Service not found');
    if (new Decimal(dto.pricePerUnit).lessThan(service.baseCostPerUnit)) {
      throw new BadRequestException(`Partner price cannot be below base cost (${service.baseCostPerUnit})`);
    }
    return this.prisma.partnerServicePricing.upsert({
      where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
      create: dto,
      update: dto,
    });
  }

  async setCustomerPricing(dto: { partnerId: string; serviceCode: string; customerPricePerUnit: number; isCustomizable?: boolean }) {
    const partnerP = await this.prisma.partnerServicePricing.findUnique({
      where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
    });
    if (partnerP && partnerP.customerMinPrice && new Decimal(dto.customerPricePerUnit).lessThan(partnerP.customerMinPrice)) {
      throw new BadRequestException(`Customer price cannot be below minimum (${partnerP.customerMinPrice})`);
    }
    return this.prisma.partnerCustomerPricing.upsert({
      where: { partnerId_serviceCode: { partnerId: dto.partnerId, serviceCode: dto.serviceCode } },
      create: dto,
      update: dto,
    });
  }

  async getPricingChain(partnerId: string, serviceCode: string) {
    const [service, partnerP, customerP] = await Promise.all([
      this.prisma.servicePricingTier.findUnique({ where: { serviceCode } }),
      this.prisma.partnerServicePricing.findUnique({ where: { partnerId_serviceCode: { partnerId, serviceCode } } }),
      this.prisma.partnerCustomerPricing.findUnique({ where: { partnerId_serviceCode: { partnerId, serviceCode } } }),
    ]);
    if (!service) throw new NotFoundException('Service not found');
    const yourMargin = partnerP ? new Decimal(partnerP.pricePerUnit).minus(service.baseCostPerUnit).toNumber() : null;
    const partnerMargin = partnerP && customerP ? new Decimal(customerP.customerPricePerUnit).minus(partnerP.pricePerUnit).toNumber() : null;
    return { service, partnerPricing: partnerP, customerPricing: customerP, margins: { yourMarginPerUnit: yourMargin, partnerMarginPerUnit: partnerMargin } };
  }
}
