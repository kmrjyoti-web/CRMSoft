import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

const BUCKETS = [
  { label: '0-3 days', min: 0, max: 3, action: 'No action' },
  { label: '4-7 days', min: 4, max: 7, action: 'Follow up' },
  { label: '8-14 days', min: 8, max: 14, action: 'Urgent follow-up' },
  { label: '15-30 days', min: 15, max: 30, action: 'Risk of expiry' },
  { label: '30+ days', min: 31, max: Infinity, action: 'Likely lost \u2014 close or revise' },
] as const;

const PENDING_STATUSES = ['SENT', 'VIEWED', 'NEGOTIATION'];

@Injectable()
export class QuotationAgingReport implements IReport {
  readonly code = 'QUOTATION_AGING';
  readonly name = 'Quotation Aging Report';
  readonly category = 'QUOTATION';
  readonly description = 'Tracks pending quotations by age buckets with recommended actions and expiry alerts';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'createdById', label: 'Created By', type: 'user' },
    { key: 'status', label: 'Status', type: 'multi_select', options: [
      { value: 'SENT', label: 'Sent' }, { value: 'VIEWED', label: 'Viewed' },
      { value: 'NEGOTIATION', label: 'Negotiation' },
    ]},
  ];

  constructor(private readonly prisma: PrismaService, private readonly drillDownSvc: DrillDownService) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000);
    const where: any = { tenantId: params.tenantId, status: { in: PENDING_STATUSES } };
    if (params.userId) where.createdById = params.userId;
    if (params.filters?.status) where.status = { in: params.filters.status };

    const quotations = await this.prisma.quotation.findMany({
      where,
      include: { lead: { select: {
        organization: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } },
        allocatedTo: { select: { firstName: true, lastName: true } },
      }}},
    });

    const bucketCounts = BUCKETS.map(() => 0);
    const bucketValues = BUCKETS.map(() => 0);
    const ages: number[] = [];
    for (const q of quotations) {
      const age = Math.floor((now.getTime() - q.createdAt.getTime()) / 86400000);
      ages.push(age);
      const idx = BUCKETS.findIndex(b => age >= b.min && age <= b.max);
      if (idx >= 0) { bucketCounts[idx]++; bucketValues[idx] += Number(q.totalAmount); }
    }

    const totalPending = quotations.length;
    const totalPendingValue = quotations.reduce((s, q) => s + Number(q.totalAmount), 0);
    const avgPendingAge = totalPending > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / totalPending) : 0;
    const isExpiring = (q: any) => q.validUntil && q.validUntil.getTime() <= sevenDaysFromNow.getTime() && q.validUntil.getTime() >= now.getTime();

    const summary: ReportMetric[] = [
      { key: 'totalPending', label: 'Total Pending', value: totalPending, format: 'number' },
      { key: 'totalPendingValue', label: 'Total Pending Value', value: totalPendingValue, format: 'currency' },
      { key: 'avgPendingAge', label: 'Avg Pending Age', value: avgPendingAge, format: 'days' },
      { key: 'expiringCount', label: 'Expiring Within 7 Days', value: quotations.filter(isExpiring).length, format: 'number' },
    ];

    const agingChart: ChartData = {
      type: 'BAR', title: 'Pending Quotations by Age Bucket', labels: BUCKETS.map(b => b.label),
      datasets: [
        { label: 'Count', data: bucketCounts, color: '#FF9800' },
        { label: 'Value', data: bucketValues.map(v => Math.round(v)), color: '#2196F3' },
      ],
    };

    // Table 1: Pending list
    const pendingRows = quotations.map(q => {
      const age = Math.floor((now.getTime() - q.createdAt.getTime()) / 86400000);
      return {
        quotationNo: q.quotationNo, organization: q.lead?.organization?.name || '',
        contact: q.lead?.contact ? `${q.lead.contact.firstName} ${q.lead.contact.lastName}` : '',
        value: Number(q.totalAmount), age, status: q.status,
        allocatedTo: q.lead?.allocatedTo ? `${q.lead.allocatedTo.firstName} ${q.lead.allocatedTo.lastName}` : 'Unassigned',
        action: BUCKETS.find(b => age >= b.min && age <= b.max)?.action || '',
      };
    }).sort((a, b) => b.age - a.age);

    const pendingCols: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 16 }, { key: 'organization', header: 'Organization', width: 22 },
      { key: 'contact', header: 'Contact', width: 20 }, { key: 'value', header: 'Value', width: 14, format: 'currency' },
      { key: 'age', header: 'Age (days)', width: 10, format: 'number' }, { key: 'status', header: 'Status', width: 12 },
      { key: 'allocatedTo', header: 'Allocated To', width: 18 }, { key: 'action', header: 'Action Needed', width: 22 },
    ];

    // Table 2: Expiring soon
    const expiringRows = quotations.filter(isExpiring).map(q => ({
      quotationNo: q.quotationNo, organization: q.lead?.organization?.name || '',
      value: Number(q.totalAmount), validUntil: q.validUntil,
      daysLeft: Math.max(0, Math.floor((q.validUntil!.getTime() - now.getTime()) / 86400000)), status: q.status,
    })).sort((a, b) => a.daysLeft - b.daysLeft);

    const expiringCols: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 16 }, { key: 'organization', header: 'Organization', width: 22 },
      { key: 'value', header: 'Value', width: 14, format: 'currency' }, { key: 'validUntil', header: 'Valid Until', width: 14, format: 'date' },
      { key: 'daysLeft', header: 'Days Left', width: 10, format: 'number' }, { key: 'status', header: 'Status', width: 12 },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts: [agingChart],
      tables: [
        { title: 'Pending Quotations', columns: pendingCols, rows: pendingRows },
        { title: 'Expiring Soon (Within 7 Days)', columns: expiringCols, rows: expiringRows },
      ],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const now = new Date();
    const bucket = BUCKETS.find(b => b.label === params.value);
    const where: any = { tenantId: params.filters?.tenantId, status: { in: PENDING_STATUSES } };
    if (bucket) {
      const minDate = bucket.max === Infinity ? new Date(0) : new Date(now.getTime() - bucket.max * 86400000);
      where.createdAt = { gte: minDate, lte: new Date(now.getTime() - bucket.min * 86400000) };
    }
    const skip = (params.page - 1) * params.limit;
    const [records, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where, skip, take: params.limit, orderBy: { createdAt: 'asc' },
        include: { lead: { select: { organization: { select: { name: true } } } }, createdByUser: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.quotation.count({ where }),
    ]);
    const columns: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 16 }, { key: 'organization', header: 'Organization', width: 22 },
      { key: 'status', header: 'Status', width: 14 }, { key: 'totalAmount', header: 'Amount', width: 16, format: 'currency' },
      { key: 'age', header: 'Age (days)', width: 10, format: 'number' }, { key: 'createdBy', header: 'Created By', width: 18 },
    ];
    const rows = records.map(q => ({
      quotationNo: q.quotationNo, organization: q.lead?.organization?.name || '', status: q.status,
      totalAmount: Number(q.totalAmount), age: Math.floor((now.getTime() - q.createdAt.getTime()) / 86400000),
      createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
    }));
    return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
  }
}
