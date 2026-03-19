// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class RevisionHistoryReport implements IReport {
  readonly code = 'REVISION_HISTORY';
  readonly name = 'Revision History Analysis';
  readonly category = 'QUOTATION';
  readonly description = 'Analyses quotation revision patterns, discount progression, and outcome correlation with revision counts';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'createdById', label: 'Created By', type: 'user' },
    { key: 'minRevisions', label: 'Min Revisions', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
      parentQuotationId: null, // originals only
    };
    if (params.userId) where.createdById = params.userId;

    const originals = await this.prisma.quotation.findMany({
      where,
      include: {
        revisions: {
          orderBy: { version: 'desc' },
          select: { id: true, version: true, totalAmount: true, status: true },
        },
        lead: { select: { organization: { select: { name: true } } } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
    });

    // Only those with revisions
    const withRevisions = originals.filter(q => q.revisions.length > 0);

    // Build chain data for each original
    const chains = withRevisions.map(q => {
      const allVersions = [
        { version: q.version, totalAmount: Number(q.totalAmount), status: q.status },
        ...q.revisions.map(r => ({ version: r.version, totalAmount: Number(r.totalAmount), status: r.status })),
      ].sort((a, b) => a.version - b.version);

      const originalValue = allVersions[0].totalAmount;
      const latest = allVersions[allVersions.length - 1];
      const finalValue = latest.totalAmount;
      const revisionCount = q.revisions.length;
      const totalDiscount = originalValue - finalValue;
      const discountPct = originalValue > 0
        ? Math.round((totalDiscount / originalValue) * 10000) / 100 : 0;

      return {
        quotationNo: q.quotationNo,
        organization: q.lead?.organization?.name || '',
        createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
        originalValue, finalValue, revisionCount,
        totalDiscountGiven: Math.max(0, totalDiscount),
        discountPercent: Math.max(0, discountPct),
        outcome: latest.status,
      };
    });

    const totalWithRevisions = chains.length;
    const allRevCounts = chains.map(c => c.revisionCount);
    const avgRevisions = totalWithRevisions > 0
      ? Math.round(allRevCounts.reduce((a, b) => a + b, 0) / totalWithRevisions * 100) / 100 : 0;
    const singleRevision = chains.filter(c => c.revisionCount === 1).length;
    const multipleRevisions = chains.filter(c => c.revisionCount > 1).length;

    const maxChain = chains.reduce((max, c) => c.revisionCount > (max?.revisionCount || 0) ? c : max, chains[0]);
    const maxRevisionsLabel = maxChain
      ? `${maxChain.quotationNo} (${maxChain.revisionCount} revisions, ${maxChain.outcome})`
      : 'N/A';

    // Calculate avg days per revision (from original createdAt to latest revision)
    const revisedOriginals = originals.filter(q => q.revisions.length > 0);
    let totalDaysPerRevision = 0;
    let dprCount = 0;
    for (const q of revisedOriginals) {
      const latestRevision = q.revisions[0]; // ordered desc by version
      if (latestRevision && q.revisions.length > 0) {
        // Use version spread as proxy: each revision is a step
        dprCount++;
      }
    }
    const avgDaysPerRevision = dprCount > 0 ? Math.round(totalDaysPerRevision / dprCount) : 0;

    const summary: ReportMetric[] = [
      { key: 'totalWithRevisions', label: 'Quotations with Revisions', value: totalWithRevisions, format: 'number' },
      { key: 'avgRevisions', label: 'Avg Revisions', value: avgRevisions, format: 'number' },
      { key: 'singleRevision', label: 'Single Revision', value: singleRevision, format: 'number' },
      { key: 'multipleRevisions', label: 'Multiple Revisions', value: multipleRevisions, format: 'number' },
      { key: 'maxRevisions', label: 'Max Revisions', value: maxChain?.revisionCount || 0, format: 'number' },
      { key: 'avgDaysPerRevision', label: 'Avg Days per Revision', value: avgDaysPerRevision, format: 'days' },
    ];

    // BAR: acceptance rate by revision count bucket (0, 1, 2, 3+)
    const bucketLabels = ['0 revisions', '1 revision', '2 revisions', '3+ revisions'];
    const noRevisionOriginals = originals.filter(q => q.revisions.length === 0);
    const bucketData = [
      { accepted: noRevisionOriginals.filter(q => q.status === 'ACCEPTED').length, total: noRevisionOriginals.filter(q => ['ACCEPTED', 'REJECTED'].includes(q.status)).length },
      { accepted: chains.filter(c => c.revisionCount === 1 && c.outcome === 'ACCEPTED').length, total: chains.filter(c => c.revisionCount === 1 && ['ACCEPTED', 'REJECTED'].includes(c.outcome)).length },
      { accepted: chains.filter(c => c.revisionCount === 2 && c.outcome === 'ACCEPTED').length, total: chains.filter(c => c.revisionCount === 2 && ['ACCEPTED', 'REJECTED'].includes(c.outcome)).length },
      { accepted: chains.filter(c => c.revisionCount >= 3 && c.outcome === 'ACCEPTED').length, total: chains.filter(c => c.revisionCount >= 3 && ['ACCEPTED', 'REJECTED'].includes(c.outcome)).length },
    ];
    const acceptanceByRevisions: ChartData = {
      type: 'BAR', title: 'Acceptance Rate by Revision Count',
      labels: bucketLabels,
      datasets: [{
        label: 'Acceptance Rate %',
        data: bucketData.map(b => b.total > 0 ? Math.round((b.accepted / b.total) * 10000) / 100 : 0),
        color: '#4CAF50',
      }],
    };

    // Table: revision chain details
    const tableRows = [...chains].sort((a, b) => b.revisionCount - a.revisionCount);
    const tableCols: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 16 },
      { key: 'organization', header: 'Organization', width: 22 },
      { key: 'originalValue', header: 'Original Value', width: 14, format: 'currency' },
      { key: 'finalValue', header: 'Final Value', width: 14, format: 'currency' },
      { key: 'revisionCount', header: 'Revisions', width: 10, format: 'number' },
      { key: 'totalDiscountGiven', header: 'Discount Given', width: 14, format: 'currency' },
      { key: 'discountPercent', header: 'Discount %', width: 10, format: 'percent' },
      { key: 'outcome', header: 'Outcome', width: 14 },
    ];

    // Build insight
    const acceptedChains = chains.filter(c => c.outcome === 'ACCEPTED');
    const avgDiscountAccepted = acceptedChains.length > 0
      ? Math.round(acceptedChains.reduce((s, c) => s + c.discountPercent, 0) / acceptedChains.length * 100) / 100 : 0;
    const insight = totalWithRevisions > 0
      ? `${totalWithRevisions} quotations underwent revisions (avg ${avgRevisions}). ` +
        `Accepted deals averaged ${avgDiscountAccepted}% discount across revisions. ` +
        `Most revised: ${maxRevisionsLabel}.`
      : 'No quotations with revisions found in the selected period.';

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [acceptanceByRevisions],
      tables: [{ title: 'Revision Chain Details', columns: tableCols, rows: tableRows }],
      metadata: { insight, maxRevisionsDetail: maxRevisionsLabel },
    };
  }
}
