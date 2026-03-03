import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
  DrillDownParams, DrillDownResult,
} from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';

@Injectable()
export class ProductWiseQuotationReport implements IReport {
  readonly code = 'PRODUCT_WISE_QUOTATION';
  readonly name = 'Product-wise Quotation Analysis';
  readonly category = 'QUOTATION';
  readonly description = 'Breaks down quotation performance by product including quote frequency, value, and acceptance rates';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'createdById', label: 'Created By', type: 'user' },
    { key: 'productName', label: 'Product Name', type: 'text' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      quotation: { createdAt: { gte: params.dateFrom, lte: params.dateTo } },
    };
    if (params.userId) where.quotation.createdById = params.userId;
    if (params.filters?.productName) where.productName = { contains: params.filters.productName, mode: 'insensitive' };

    const lineItems = await this.prisma.quotationLineItem.findMany({
      where,
      include: {
        quotation: { select: { status: true } },
      },
    });

    // Group by productName
    const productMap = new Map<string, {
      timesQuoted: number; totalQuantity: number; totalValue: number;
      prices: number[]; accepted: number; rejected: number; pending: number;
    }>();

    for (const li of lineItems) {
      const name = li.productName;
      const entry = productMap.get(name) || {
        timesQuoted: 0, totalQuantity: 0, totalValue: 0,
        prices: [], accepted: 0, rejected: 0, pending: 0,
      };
      entry.timesQuoted++;
      entry.totalQuantity += Number(li.quantity);
      entry.totalValue += Number(li.lineTotal);
      entry.prices.push(Number(li.unitPrice));
      const st = li.quotation.status;
      if (st === 'ACCEPTED') entry.accepted++;
      else if (st === 'REJECTED') entry.rejected++;
      else if (['SENT', 'VIEWED', 'NEGOTIATION'].includes(st)) entry.pending++;
      productMap.set(name, entry);
    }

    const products = [...productMap.entries()].map(([name, data]) => ({
      productName: name,
      timesQuoted: data.timesQuoted,
      totalQuantity: Math.round(data.totalQuantity * 100) / 100,
      totalValue: Math.round(data.totalValue * 100) / 100,
      avgUnitPrice: data.prices.length > 0
        ? Math.round((data.prices.reduce((a, b) => a + b, 0) / data.prices.length) * 100) / 100 : 0,
      accepted: data.accepted,
      rejected: data.rejected,
      pending: data.pending,
      acceptanceRate: data.accepted + data.rejected > 0
        ? Math.round((data.accepted / (data.accepted + data.rejected)) * 10000) / 100 : 0,
    }));

    const totalProducts = products.length;
    const topByQuoted = products.reduce((top, p) => p.timesQuoted > (top?.timesQuoted || 0) ? p : top, products[0]);
    const topByRevenue = products.reduce((top, p) => p.totalValue > (top?.totalValue || 0) ? p : top, products[0]);

    const summary: ReportMetric[] = [
      { key: 'totalProducts', label: 'Total Products', value: totalProducts, format: 'number' },
      { key: 'topProduct', label: `Top Product (by Quotes): ${topByQuoted?.productName || 'N/A'}`, value: topByQuoted?.timesQuoted || 0, format: 'number' },
      { key: 'topProductByRevenue', label: `Top Product (by Revenue): ${topByRevenue?.productName || 'N/A'}`, value: topByRevenue?.totalValue || 0, format: 'currency' },
    ];

    // BAR: times quoted by product (top 15)
    const sortedByQuotes = [...products].sort((a, b) => b.timesQuoted - a.timesQuoted).slice(0, 15);
    const quotedChart: ChartData = {
      type: 'BAR', title: 'Times Quoted by Product',
      labels: sortedByQuotes.map(p => p.productName),
      datasets: [{ label: 'Times Quoted', data: sortedByQuotes.map(p => p.timesQuoted), color: '#2196F3' }],
    };

    // BAR: acceptance rate by product (top 15 by volume)
    const sortedByVolume = [...products].sort((a, b) => b.timesQuoted - a.timesQuoted).slice(0, 15);
    const acceptanceChart: ChartData = {
      type: 'BAR', title: 'Acceptance Rate by Product',
      labels: sortedByVolume.map(p => p.productName),
      datasets: [{ label: 'Acceptance Rate %', data: sortedByVolume.map(p => p.acceptanceRate), color: '#4CAF50' }],
    };

    // Table: product breakdown
    const tableRows = [...products].sort((a, b) => b.totalValue - a.totalValue);
    const tableCols: ColumnDef[] = [
      { key: 'productName', header: 'Product', width: 22 },
      { key: 'timesQuoted', header: 'Quoted', width: 10, format: 'number' },
      { key: 'totalQuantity', header: 'Total Qty', width: 10, format: 'number' },
      { key: 'totalValue', header: 'Total Value', width: 14, format: 'currency' },
      { key: 'avgUnitPrice', header: 'Avg Price', width: 12, format: 'currency' },
      { key: 'accepted', header: 'Accepted', width: 10, format: 'number' },
      { key: 'rejected', header: 'Rejected', width: 10, format: 'number' },
      { key: 'pending', header: 'Pending', width: 10, format: 'number' },
      { key: 'acceptanceRate', header: 'Accept Rate', width: 12, format: 'percent' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary,
      charts: [quotedChart, acceptanceChart],
      tables: [{ title: 'Product Breakdown', columns: tableCols, rows: tableRows }],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'product') {
      where.lineItems = { some: { productName: params.value } };
    }

    const skip = (params.page - 1) * params.limit;
    const [records, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where, skip, take: params.limit, orderBy: { createdAt: 'desc' },
        include: {
          lineItems: { where: { productName: params.value }, select: { quantity: true, unitPrice: true, lineTotal: true } },
          createdByUser: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    const columns: ColumnDef[] = [
      { key: 'quotationNo', header: 'Quotation #', width: 16 },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'quantity', header: 'Quantity', width: 10, format: 'number' },
      { key: 'unitPrice', header: 'Unit Price', width: 12, format: 'currency' },
      { key: 'lineTotal', header: 'Line Total', width: 14, format: 'currency' },
      { key: 'createdBy', header: 'Created By', width: 18 },
      { key: 'createdAt', header: 'Created', width: 14, format: 'date' },
    ];

    const rows = records.map(q => {
      const li = q.lineItems[0];
      return {
        quotationNo: q.quotationNo,
        status: q.status,
        quantity: li ? Number(li.quantity) : 0,
        unitPrice: li ? Number(li.unitPrice) : 0,
        lineTotal: li ? Number(li.lineTotal) : 0,
        createdBy: q.createdByUser ? `${q.createdByUser.firstName} ${q.createdByUser.lastName}` : '',
        createdAt: q.createdAt,
      };
    });

    return { dimension: params.dimension, value: params.value, columns, rows, total, page: params.page, limit: params.limit };
  }
}
