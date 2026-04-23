import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.partnerBranding.create({ data: dto });
  }

  async getByPartner(partnerId: string) {
    const b = await this.prisma.partnerBranding.findUnique({ where: { partnerId } });
    if (!b) throw new NotFoundException('Branding not found');
    return b;
  }

  async getByDomain(domain: string) {
    const pd = await this.prisma.partnerDomain.findUnique({ where: { domain }, include: { partner: { include: { branding: true } } } });
    if (!pd) throw new NotFoundException('Domain not found');
    return pd.partner.branding;
  }

  async update(partnerId: string, dto: any) {
    await this.getByPartner(partnerId);
    return this.prisma.partnerBranding.update({ where: { partnerId }, data: dto });
  }
}
