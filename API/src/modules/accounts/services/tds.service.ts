import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class TDSService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: {
    section?: string;
    financialYear?: string;
    quarter?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    if (filters?.section) where.section = filters.section;
    if (filters?.financialYear) where.financialYear = filters.financialYear;
    if (filters?.quarter) where.quarter = filters.quarter;
    if (filters?.status) where.status = filters.status;

    return this.prisma.tDSRecord.findMany({ where, orderBy: { deductionDate: 'desc' } });
  }

  async markDeposited(tenantId: string, id: string, depositDate: string, challanNumber?: string) {
    const record = await this.prisma.tDSRecord.findFirst({ where: { id, tenantId } });
    if (!record) throw new NotFoundException('TDS record not found');

    return this.prisma.tDSRecord.update({
      where: { id },
      data: {
        status: 'DEPOSITED',
        depositDate: new Date(depositDate),
        challanNumber,
      },
    });
  }

  async getSummary(tenantId: string, financialYear?: string) {
    const fy = financialYear || this.getCurrentFY();
    const records = await this.prisma.tDSRecord.findMany({
      where: { tenantId, financialYear: fy },
    });

    // Group by section
    const bySection: Record<string, { section: string; sectionName: string; count: number; totalDeducted: number; totalDeposited: number }> = {};
    for (const r of records) {
      if (!bySection[r.section]) {
        bySection[r.section] = { section: r.section, sectionName: r.sectionName || r.section, count: 0, totalDeducted: 0, totalDeposited: 0 };
      }
      bySection[r.section].count++;
      bySection[r.section].totalDeducted += Number(r.tdsAmount);
      if (r.status === 'DEPOSITED') bySection[r.section].totalDeposited += Number(r.tdsAmount);
    }

    // Group by quarter
    const byQuarter: Record<string, { quarter: string; count: number; total: number; deposited: number }> = {};
    for (const r of records) {
      const q = r.quarter || 'Unknown';
      if (!byQuarter[q]) byQuarter[q] = { quarter: q, count: 0, total: 0, deposited: 0 };
      byQuarter[q].count++;
      byQuarter[q].total += Number(r.tdsAmount);
      if (r.status === 'DEPOSITED') byQuarter[q].deposited += Number(r.tdsAmount);
    }

    return {
      financialYear: fy,
      totalRecords: records.length,
      totalDeducted: Math.round(records.reduce((s, r) => s + Number(r.tdsAmount), 0) * 100) / 100,
      totalDeposited: Math.round(records.filter((r) => r.status === 'DEPOSITED').reduce((s, r) => s + Number(r.tdsAmount), 0) * 100) / 100,
      pendingDeposit: records.filter((r) => r.status === 'DEDUCTED').length,
      bySection: Object.values(bySection),
      byQuarter: Object.values(byQuarter),
    };
  }

  private getCurrentFY(): string {
    const now = new Date();
    const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
}
