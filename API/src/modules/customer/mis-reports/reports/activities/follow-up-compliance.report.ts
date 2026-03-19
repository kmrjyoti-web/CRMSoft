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
export class FollowUpComplianceReport implements IReport {
  readonly code = 'FOLLOW_UP_COMPLIANCE';
  readonly name = 'Follow-Up Compliance';
  readonly category = 'ACTIVITY';
  readonly description = 'Measures follow-up completion rates and identifies overdue activities per user';
  readonly supportsDrillDown = true;
  readonly supportsPeriodComparison = true;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'createdById', label: 'User', type: 'user' },
    { key: 'type', label: 'Activity Type', type: 'select', options: [
      { value: 'CALL', label: 'Call' }, { value: 'EMAIL', label: 'Email' },
      { value: 'MEETING', label: 'Meeting' }, { value: 'VISIT', label: 'Visit' },
    ]},
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly drillDownSvc: DrillDownService,
  ) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      scheduledAt: { not: null, gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.createdById = params.userId;
    if (params.filters?.type) where.type = params.filters.type;

    const activities = await this.prisma.activity.findMany({
      where,
      select: {
        id: true, subject: true, type: true,
        scheduledAt: true, completedAt: true, createdAt: true,
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        lead: { select: { leadNumber: true } },
      },
    });

    const now = new Date();
    const totalScheduled = activities.length;
    const completed = activities.filter(a => a.completedAt != null).length;
    const overdue = activities.filter(a => !a.completedAt && a.scheduledAt! < now).length;
    const complianceRate = totalScheduled > 0
      ? Math.round((completed / totalScheduled) * 10000) / 100
      : 0;

    // Per user breakdown
    const userMap = new Map<string, {
      name: string; scheduled: number; completed: number; overdue: number;
    }>();

    activities.forEach(a => {
      const userId = a.createdByUser.id;
      const userName = `${a.createdByUser.firstName} ${a.createdByUser.lastName}`;
      if (!userMap.has(userId)) {
        userMap.set(userId, { name: userName, scheduled: 0, completed: 0, overdue: 0 });
      }
      const entry = userMap.get(userId)!;
      entry.scheduled++;
      if (a.completedAt) entry.completed++;
      else if (a.scheduledAt! < now) entry.overdue++;
    });

    const userStats = [...userMap.entries()].map(([userId, data]) => ({
      userId,
      ...data,
      compliancePercent: data.scheduled > 0
        ? Math.round((data.completed / data.scheduled) * 10000) / 100
        : 0,
    }));
    userStats.sort((a, b) => b.compliancePercent - a.compliancePercent);

    const summary: ReportMetric[] = [
      { key: 'totalScheduled', label: 'Total Scheduled', value: totalScheduled, format: 'number' },
      { key: 'completed', label: 'Completed', value: completed, format: 'number' },
      { key: 'overdue', label: 'Overdue', value: overdue, format: 'number' },
      { key: 'complianceRate', label: 'Compliance Rate', value: complianceRate, format: 'percent' },
    ];

    const charts: ChartData[] = [
      {
        type: 'BAR', title: 'Compliance % by User',
        labels: userStats.map(u => u.name),
        datasets: [{ label: 'Compliance %', data: userStats.map(u => u.compliancePercent), color: '#4CAF50' }],
      },
    ];

    // Compliance table
    const complianceColumns: ColumnDef[] = [
      { key: 'name', header: 'User', width: 22 },
      { key: 'scheduled', header: 'Scheduled', width: 12, format: 'number' },
      { key: 'completed', header: 'Completed', width: 12, format: 'number' },
      { key: 'overdue', header: 'Overdue', width: 12, format: 'number' },
      { key: 'compliancePercent', header: 'Compliance %', width: 14, format: 'percent' },
    ];

    // Overdue activities list (top 20)
    const overdueActivities = activities
      .filter(a => !a.completedAt && a.scheduledAt! < now)
      .sort((a, b) => a.scheduledAt!.getTime() - b.scheduledAt!.getTime())
      .slice(0, 20)
      .map(a => ({
        subject: a.subject,
        type: a.type,
        scheduledAt: a.scheduledAt,
        user: `${a.createdByUser.firstName} ${a.createdByUser.lastName}`,
        leadNumber: a.lead?.leadNumber || '',
        daysOverdue: Math.ceil((now.getTime() - a.scheduledAt!.getTime()) / 86400000),
      }));

    const overdueColumns: ColumnDef[] = [
      { key: 'subject', header: 'Subject', width: 25 },
      { key: 'type', header: 'Type', width: 12 },
      { key: 'scheduledAt', header: 'Scheduled', width: 15, format: 'date' },
      { key: 'user', header: 'User', width: 20 },
      { key: 'leadNumber', header: 'Lead #', width: 16 },
      { key: 'daysOverdue', header: 'Days Overdue', width: 14, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [
        { title: 'User Compliance', columns: complianceColumns, rows: userStats },
        { title: 'Overdue Activities (Top 20)', columns: overdueColumns, rows: overdueActivities },
      ],
    };
  }

  async drillDown(params: DrillDownParams): Promise<DrillDownResult> {
    const where: any = {
      tenantId: params.filters?.tenantId,
      scheduledAt: { not: null, gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.dimension === 'user') where.createdById = params.value;
    const result = await this.drillDownSvc.getActivities(where, params.page, params.limit);
    return { ...result, dimension: params.dimension, value: params.value };
  }
}
