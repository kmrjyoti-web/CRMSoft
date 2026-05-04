// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';

@Injectable()
export class QuotationSummaryReport implements IReport {
  readonly code = 'QUOTATION_SUMMARY';
  readonly name = 'Quotation Summary';
  readonly category = 'QUOTATION';
  readonly description = 'Overall quotation KPIs including volume, value, acceptance rates, and response times';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'status', label: 'Quotation Status', type: 'multi_select', options: [
      { value: 'DRAFT', label: 'Draft' }, { value: 'INTERNAL_REVIEW', label: 'Internal Review' },
      { value: 'SENT', label: 'Sent' }, { value: 'VIEWED', label: 'Viewed' },
      { value: 'NEGOTIATION', label: 'Negotiation' }, { value: 'ACCEPTED', label: 'Accepted' },
      { value: 'REJECTED', label: 'Rejected' }, { value: 'EXPIRED', label: 'Expired' },
      { value: 'REVISED', label: 'Revised' }, { value: 'CANCELLED', label: 'Cancelled' },
    ]},
    { key: 'createdById', label: 'Created By', type: 'user' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = { tenantId: params.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.userId) where.createdById = params.userId;
    if (params.filters?.status) where.status = { in: params.filters.status };

    const rawQuotations = await this.prisma.working.quotation.findMany({
      where,
      include: {
        sendLogs: { orderBy: { sentAt: 'asc' }, take: 1, select: { sentAt: true } },
      },
    });
    const quotations = await this.resolver.resolveUsers(rawQuotations, ['createdById'], { id: true, firstName: true, lastName: true });

    const total = quotations.length;
    const bySt = (st: string) => quotations.filter(q => q.status === st);
    const accepted = bySt('ACCEPTED').length;
    const rejected = bySt('REJECTED').length;
    const sentStatuses = ['SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED'];
    const totalValue = quotations.reduce((s, q) => s + Number(q.totalAmount), 0);
    const acceptanceRate = accepted + rejected > 0 ? Math.round((accepted / (accepted + rejected)) * 10000) / 100 : 0;

    const avgDaysFor = (qs: typeof quotations, dateField: 'acceptedAt' | 'rejectedAt') => {
      const days = qs.map(q => {
        const sent = q.sendLogs[0]?.sentAt || q.createdAt;
        return ((q as unknown)[dateField]!.getTime() - sent.getTime()) / 86400000;
      }).filter(d => d >= 0);
      return days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
    };

    const summary: ReportMetric[] = [
      { key: 'totalQuotations', label: 'Total Quotations', value: total, format: 'number' },
      { key: 'draft', label: 'Draft', value: bySt('DRAFT').length, format: 'number' },
      { key: 'sent', label: 'Sent', value: bySt('SENT').length, format: 'number' },
      { key: 'viewed', label: 'Viewed', value: bySt('VIEWED').length, format: 'number' },
      { key: 'accepted', label: 'Accepted', value: accepted, format: 'number' },
      { key: 'rejected', label: 'Rejected', value: rejected, format: 'number' },
      { key: 'expired', label: 'Expired', value: bySt('EXPIRED').length, format: 'number' },
      { key: 'revised', label: 'Revised', value: bySt('REVISED').length, format: 'number' },
      { key: 'totalValue', label: 'Total Value', value: totalValue, format: 'currency' },
      { key: 'acceptedValue', label: 'Accepted Value', value: bySt('ACCEPTED').reduce((s, q) => s + Number(q.totalAmount), 0), format: 'currency' },
      { key: 'rejectedValue', label: 'Rejected Value', value: bySt('REJECTED').reduce((s, q) => s + Number(q.totalAmount), 0), format: 'currency' },
      { key: 'pendingValue', label: 'Pending Value', value: quotations.filter(q => ['SENT', 'VIEWED'].includes(q.status)).reduce((s, q) => s + Number(q.totalAmount), 0), format: 'currency' },
      { key: 'acceptanceRate', label: 'Acceptance Rate', value: acceptanceRate, format: 'percent' },
      { key: 'avgQuotationValue', label: 'Avg Quotation Value', value: total > 0 ? Math.round(totalValue / total) : 0, format: 'currency' },
      { key: 'avgDaysToAccept', label: 'Avg Days to Accept', value: avgDaysFor(bySt('ACCEPTED'), 'acceptedAt'), format: 'days' },
      { key: 'avgDaysToReject', label: 'Avg Days to Reject', value: avgDaysFor(bySt('REJECTED'), 'rejectedAt'), format: 'days' },
    ];

    // PIE: status distribution
    const statusCounts = new Map<string, number>();
    quotations.forEach(q => statusCounts.set(q.status, (statusCounts.get(q.status) || 0) + 1));
    const statusLabels = [...statusCounts.keys()];
    const statusPie: ChartData = {
      type: 'PIE', title: 'Quotation Status Distribution', labels: statusLabels,
      datasets: [{ label: 'Count', data: statusLabels.map(s => statusCounts.get(s)!) }],
    };

    // BAR: sent vs accepted by month
    const monthSent = new Map<string, number>();
    const monthAccepted = new Map<string, number>();
    quotations.forEach(q => {
      const key = `${q.createdAt.getFullYear()}-${String(q.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (sentStatuses.includes(q.status)) monthSent.set(key, (monthSent.get(key) || 0) + 1);
      if (q.status === 'ACCEPTED') monthAccepted.set(key, (monthAccepted.get(key) || 0) + 1);
    });
    const months = [...new Set([...monthSent.keys(), ...monthAccepted.keys()])].sort();
    const sentVsAccepted: ChartData = {
      type: 'BAR', title: 'Quotations Sent vs Accepted by Month', labels: months,
      datasets: [
        { label: 'Sent', data: months.map(m => monthSent.get(m) || 0), color: '#2196F3' },
        { label: 'Accepted', data: months.map(m => monthAccepted.get(m) || 0), color: '#4CAF50' },
      ],
    };

    // Table: by user
    const userMap = new Map<string, { name: string; sent: number; accepted: number; rejected: number; totalVal: number }>();
    quotations.forEach(q => {
      const uid = q.createdBy?.id || 'unknown';
      const name = q.createdBy ? `${q.createdBy.firstName} ${q.createdBy.lastName}` : 'Unknown';
      const e = userMap.get(uid) || { name, sent: 0, accepted: 0, rejected: 0, totalVal: 0 };
      if (sentStatuses.includes(q.status)) e.sent++;
      if (q.status === 'ACCEPTED') e.accepted++;
      if (q.status === 'REJECTED') e.rejected++;
      e.totalVal += Number(q.totalAmount);
      userMap.set(uid, e);
    });
    const userRows = [...userMap.values()].map(u => ({
      userName: u.name, sent: u.sent, accepted: u.accepted, rejected: u.rejected,
      acceptanceRate: u.accepted + u.rejected > 0 ? Math.round((u.accepted / (u.accepted + u.rejected)) * 10000) / 100 : 0,
      totalValue: u.totalVal,
    })).sort((a, b) => b.totalValue - a.totalValue);

    const userCols: ColumnDef[] = [
      { key: 'userName', header: 'User', width: 20 }, { key: 'sent', header: 'Sent', width: 10, format: 'number' },
      { key: 'accepted', header: 'Accepted', width: 10, format: 'number' }, { key: 'rejected', header: 'Rejected', width: 10, format: 'number' },
      { key: 'acceptanceRate', header: 'Accept Rate', width: 12, format: 'percent' }, { key: 'totalValue', header: 'Total Value', width: 16, format: 'currency' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts: [statusPie, sentVsAccepted],
      tables: [{ title: 'Performance by User', columns: userCols, rows: userRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = { tenantId: params.filters?.tenantId, createdAt: { gte: params.dateFrom, lte: params.dateTo } };
    if (params.dimension === 'status') where.status = params.value;
    const skip = (params.page - 1) * params.limit;
    const [rawRecords, total] = await Promise.all([
      this.prisma.working.quotation.findMany({
        where, skip, take: params.limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.quotation.count({ where }),
    ]);
    const records = await this.resolver.resolveUsers(rawRecords, ['createdById'], { firstName: true, lastName: true });
    const columns: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 18 }, { key: 'title', header: 'Title', width: 25 },
      { key: 'status', header: 'Status', width: 14 }, { key: 'totalAmount', header: 'Amount', width: 16, format: 'currency' },
      { key: 'createdBy', header: 'Created By', width: 20 }, { key: 'createdAt', header: 'Created', width: 15, format: 'date' },
    ];
    const rows = records.map(q => ({
      quotationNo: q.quotationNo, title: q.title || '', status: q.status,
      totalAmount: Number(q.totalAmount),
      createdBy: q.createdBy ? `${q.createdBy.firstName} ${q.createdBy.lastName}` : '',
      createdAt: q.createdAt,
    }));
    return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
  }
}
