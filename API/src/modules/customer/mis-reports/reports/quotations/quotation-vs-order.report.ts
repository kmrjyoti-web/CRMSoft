import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class QuotationVsOrderReport implements IReport {
  readonly code = 'QUOTATION_VS_ORDER';
  readonly name = 'Quotation vs Order';
  readonly category = 'QUOTATION';
  readonly description = 'Compares quoted amounts against won deal values, highlighting discount patterns and revision impact';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'createdById', label: 'Created By', type: 'user' },
    { key: 'minDiscount', label: 'Min Discount %', type: 'text' },
    { key: 'maxDiscount', label: 'Max Discount %', type: 'text' },
  ];

  constructor(private readonly prisma: PrismaService, private readonly drillDownSvc: DrillDownService) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId, status: 'ACCEPTED',
      createdAt: { gte: params.dateFrom, lte: params.dateTo }, lead: { status: 'WON' },
    };
    if (params.userId) where.createdById = params.userId;

    const quotations = await this.prisma.quotation.findMany({
      where,
      include: {
        lead: { select: { expectedValue: true, allocatedTo: { select: { id: true, firstName: true, lastName: true } }, organization: { select: { name: true } } } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        revisions: { select: { id: true } },
      },
    });

    const deals = quotations.map(q => {
      const quotedAmount = Number(q.totalAmount);
      const wonAmount = Number(q.lead?.expectedValue || 0);
      const discountPct = quotedAmount > 0 ? Math.round(((quotedAmount - wonAmount) / quotedAmount) * 10000) / 100 : 0;
      return { q, quotedAmount, wonAmount, discountPct, revisionCount: q.revisions?.length || 0 };
    });

    const totalQuoted = deals.reduce((s, d) => s + d.quotedAmount, 0);
    const totalWon = deals.reduce((s, d) => s + d.wonAmount, 0);
    const avgDiscountPct = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.discountPct, 0) / deals.length * 100) / 100 : 0;
    const avgRevisions = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.revisionCount, 0) / deals.length * 100) / 100 : 0;

    const summary: ReportMetric[] = [
      { key: 'totalQuoted', label: 'Total Quoted', value: totalQuoted, format: 'currency' },
      { key: 'totalWon', label: 'Total Won', value: totalWon, format: 'currency' },
      { key: 'avgDiscountPercent', label: 'Avg Discount %', value: avgDiscountPct, format: 'percent' },
      { key: 'avgRevisions', label: 'Avg Revisions', value: avgRevisions, format: 'number' },
      { key: 'noDiscountDeals', label: 'No Discount Deals', value: deals.filter(d => d.discountPct <= 0).length, format: 'number' },
      { key: 'heavyDiscountDeals', label: 'Heavy Discount (>25%)', value: deals.filter(d => d.discountPct > 25).length, format: 'number' },
    ];

    // BAR: quoted vs won by month
    const monthQuoted = new Map<string, number>();
    const monthWon = new Map<string, number>();
    deals.forEach(d => {
      const key = `${d.q.createdAt.getFullYear()}-${String(d.q.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthQuoted.set(key, (monthQuoted.get(key) || 0) + d.quotedAmount);
      monthWon.set(key, (monthWon.get(key) || 0) + d.wonAmount);
    });
    const months = [...new Set([...monthQuoted.keys(), ...monthWon.keys()])].sort();
    const quotedVsWonChart: ChartData = {
      type: 'BAR', title: 'Quoted vs Won Amounts by Month', labels: months,
      datasets: [
        { label: 'Quoted', data: months.map(m => Math.round(monthQuoted.get(m) || 0)), color: '#2196F3' },
        { label: 'Won', data: months.map(m => Math.round(monthWon.get(m) || 0)), color: '#4CAF50' },
      ],
    };

    // BAR: avg discount by user (reuse for both chart and table)
    const userMap = new Map<string, { name: string; totalPct: number; count: number }>();
    deals.forEach(d => {
      const uid = d.q.createdByUser?.id || 'unknown';
      const name = d.q.createdByUser ? `${d.q.createdByUser.firstName} ${d.q.createdByUser.lastName}` : 'Unknown';
      const e = userMap.get(uid) || { name, totalPct: 0, count: 0 };
      e.totalPct += d.discountPct; e.count++;
      userMap.set(uid, e);
    });
    const users = [...userMap.values()].sort((a, b) => b.count - a.count);
    const discountChart: ChartData = {
      type: 'BAR', title: 'Avg Discount % by User', labels: users.map(u => u.name),
      datasets: [{ label: 'Avg Discount %', data: users.map(u => u.count > 0 ? Math.round((u.totalPct / u.count) * 100) / 100 : 0), color: '#FF9800' }],
    };

    const userRows = users.map(u => ({
      userName: u.name, deals: u.count,
      avgDiscount: u.count > 0 ? Math.round((u.totalPct / u.count) * 100) / 100 : 0,
    }));
    const userCols: ColumnDef[] = [
      { key: 'userName', header: 'User', width: 22 }, { key: 'deals', header: 'Deals', width: 10, format: 'number' },
      { key: 'avgDiscount', header: 'Avg Discount %', width: 14, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts: [quotedVsWonChart, discountChart],
      tables: [{ title: 'Discount by User', columns: userCols, rows: userRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId, status: 'ACCEPTED',
      createdAt: { gte: params.dateFrom, lte: params.dateTo }, lead: { status: 'WON' },
    };
    if (params.dimension === 'user') where.createdById = params.value;
    const skip = (params.page - 1) * params.limit;
    const [records, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where, skip, take: params.limit, orderBy: { createdAt: 'desc' },
        include: { lead: { select: { expectedValue: true, organization: { select: { name: true } } } }, createdByUser: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.quotation.count({ where }),
    ]);
    const columns: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 16 }, { key: 'organization', header: 'Organization', width: 22 },
      { key: 'quotedAmount', header: 'Quoted', width: 14, format: 'currency' }, { key: 'wonAmount', header: 'Won', width: 14, format: 'currency' },
      { key: 'discountPct', header: 'Discount %', width: 12, format: 'percent' }, { key: 'createdBy', header: 'Created By', width: 18 },
    ];
    const rows = records.map(q => {
      const quoted = Number(q.totalAmount), won = Number(q.lead?.expectedValue || 0);
      return {
        quotationNo: q.quotationNo, organization: q.lead?.organization?.name || '',
        quotedAmount: quoted, wonAmount: won,
        discountPct: quoted > 0 ? Math.round(((quoted - won) / quoted) * 10000) / 100 : 0,
        createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
      };
    });
    return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
  }
}
