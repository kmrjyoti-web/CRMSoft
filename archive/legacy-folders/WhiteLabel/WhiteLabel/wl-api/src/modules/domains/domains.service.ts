import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { DomainType } from '@prisma/client';

@Injectable()
export class DomainsService {
  constructor(private prisma: PrismaService) {}

  async add(dto: { partnerId: string; domain: string; domainType: DomainType }) {
    const existing = await this.prisma.partnerDomain.findUnique({ where: { domain: dto.domain } });
    if (existing) throw new ConflictException('Domain already registered');
    const verificationToken = randomUUID();
    const dnsRecords = {
      cname: { type: 'CNAME', name: `_verify.${dto.domain}`, value: `verify.whitelabel.crmsoft.in` },
      txt: { type: 'TXT', name: `_wl-verify.${dto.domain}`, value: verificationToken },
    };
    return this.prisma.partnerDomain.create({ data: { ...dto, verificationToken, dnsRecords } });
  }

  async listByPartner(partnerId: string) {
    return this.prisma.partnerDomain.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' } });
  }

  async remove(id: string) {
    const d = await this.prisma.partnerDomain.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Domain not found');
    return this.prisma.partnerDomain.delete({ where: { id } });
  }

  async verify(id: string) {
    const d = await this.prisma.partnerDomain.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Domain not found');
    // In production: do actual DNS lookup. For now, simulate success.
    return this.prisma.partnerDomain.update({ where: { id }, data: { isVerified: true, verifiedAt: new Date(), sslStatus: 'ACTIVE' } });
  }

  async getDnsRecords(id: string) {
    const d = await this.prisma.partnerDomain.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Domain not found');
    return { domain: d.domain, verificationToken: d.verificationToken, dnsRecords: d.dnsRecords };
  }
}
