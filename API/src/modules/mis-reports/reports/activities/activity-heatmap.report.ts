import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import {
  ReportParams, ReportData, ReportMetric, ChartData, ColumnDef,
} from '../../interfaces/report.interface';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

@Injectable()
export class ActivityHeatmapReport implements IReport {
  readonly code = 'ACTIVITY_HEATMAP';
  readonly name = 'Activity Heatmap';
  readonly category = 'ACTIVITY';
  readonly description = 'Visualizes activity patterns in a day-of-week by hour-of-day heatmap to identify peak engagement times';
  readonly supportsDrillDown = false;
  readonly supportsPeriodComparison = false;

  readonly availableFilters: FilterDefinition[] = [
    { key: 'dateRange', label: 'Date Range', type: 'date_range', required: true },
    { key: 'type', label: 'Activity Type', type: 'select', options: [
      { value: 'CALL', label: 'Call' }, { value: 'EMAIL', label: 'Email' },
      { value: 'MEETING', label: 'Meeting' }, { value: 'NOTE', label: 'Note' },
      { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'SMS', label: 'SMS' },
      { value: 'VISIT', label: 'Visit' },
    ]},
    { key: 'createdById', label: 'Performed By', type: 'user' },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async generate(params: ReportParams): Promise<ReportData> {
    const where: any = {
      tenantId: params.tenantId,
      createdAt: { gte: params.dateFrom, lte: params.dateTo },
    };
    if (params.userId) where.createdById = params.userId;
    if (params.filters?.type) where.type = params.filters.type;

    const activities = await this.prisma.activity.findMany({
      where,
      select: { createdAt: true },
    });

    // Build 7x24 grid
    const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

    activities.forEach(a => {
      const day = a.createdAt.getDay();
      const hour = a.createdAt.getHours();
      grid[day][hour]++;
    });

    const totalActivities = activities.length;
    const totalSlots = 7 * 24;
    const avgPerSlot = totalActivities > 0
      ? Math.round((totalActivities / totalSlots) * 100) / 100
      : 0;

    // Find peak and quiet times
    let peakDay = 0, peakHour = 0, peakCount = 0;
    let quietDay = 0, quietHour = 0, quietCount = Infinity;

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (grid[d][h] > peakCount) {
          peakCount = grid[d][h];
          peakDay = d;
          peakHour = h;
        }
        if (grid[d][h] < quietCount) {
          quietCount = grid[d][h];
          quietDay = d;
          quietHour = h;
        }
      }
    }

    const peakTime = `${DAYS_OF_WEEK[peakDay]} ${String(peakHour).padStart(2, '0')}:00`;
    const quietTime = `${DAYS_OF_WEEK[quietDay]} ${String(quietHour).padStart(2, '0')}:00`;

    const summary: ReportMetric[] = [
      { key: 'totalActivities', label: 'Total Activities', value: totalActivities, format: 'number' },
      { key: 'peakTime', label: 'Peak Time Count', value: peakCount, format: 'number' },
      { key: 'quietTime', label: 'Quiet Time Count', value: quietCount, format: 'number' },
      { key: 'avgPerSlot', label: 'Avg per Slot', value: avgPerSlot, format: 'number' },
    ];

    const hourLabels = HOURS.map(h => `${String(h).padStart(2, '0')}:00`);
    const charts: ChartData[] = [
      {
        type: 'HEATMAP', title: 'Activity Heatmap (Day x Hour)',
        labels: hourLabels,
        datasets: DAYS_OF_WEEK.map((day, idx) => ({
          label: day,
          data: grid[idx],
        })),
      },
    ];

    // Top 10 peak slots
    const slots: Array<{ day: string; hour: string; count: number }> = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        slots.push({
          day: DAYS_OF_WEEK[d],
          hour: `${String(h).padStart(2, '0')}:00`,
          count: grid[d][h],
        });
      }
    }
    slots.sort((a, b) => b.count - a.count);
    const top10Slots = slots.slice(0, 10);

    const tableColumns: ColumnDef[] = [
      { key: 'day', header: 'Day', width: 14 },
      { key: 'hour', header: 'Hour', width: 10 },
      { key: 'count', header: 'Activities', width: 12, format: 'number' },
    ];

    return {
      reportCode: this.code, reportName: this.name, category: this.category,
      generatedAt: new Date(), params, summary, charts,
      tables: [{ title: 'Top 10 Peak Slots', columns: tableColumns, rows: top10Slots }],
      metadata: { peakTime, quietTime },
    };
  }
}
