import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    partnerId?: string;
    action: string;
    performedBy: string;
    performedByRole: string;
    details?: any;
    ipAddress?: string;
  }) {
    return this.prisma.partnerAuditLog.create({ data: params });
  }

  async getPartnerLogs(partnerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.partnerAuditLog.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.partnerAuditLog.count({ where: { partnerId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getAllLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.partnerAuditLog.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.partnerAuditLog.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
