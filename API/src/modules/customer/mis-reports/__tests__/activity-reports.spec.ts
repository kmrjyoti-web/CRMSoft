import { ActivitySummaryReport } from '../reports/activities/activity-summary.report';
import { ActivityHeatmapReport } from '../reports/activities/activity-heatmap.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-10'),
  tenantId: 'tenant-1',
};

describe('ActivitySummaryReport', () => {
  let mockPrisma: any;
  let mockDrillDown: any;
  let report: ActivitySummaryReport;

  beforeEach(() => {
    mockPrisma = {
      activity: { findMany: jest.fn(), count: jest.fn() },
    } as any;
(mockPrisma as any).working = mockPrisma;
    mockDrillDown = { getActivities: jest.fn() } as any;
    report = new ActivitySummaryReport(mockPrisma, mockDrillDown);
  });

  it('type counts: PIE chart labels include all active types and totalActivities is correct', async () => {
    const activities = [
      { id: '1', type: 'CALL', createdAt: new Date('2025-01-02T10:00:00'), createdByUser: { firstName: 'Alice', lastName: 'Smith' } },
      { id: '2', type: 'CALL', createdAt: new Date('2025-01-03T11:00:00'), createdByUser: { firstName: 'Alice', lastName: 'Smith' } },
      { id: '3', type: 'EMAIL', createdAt: new Date('2025-01-04T09:00:00'), createdByUser: { firstName: 'Bob', lastName: 'Jones' } },
      { id: '4', type: 'MEETING', createdAt: new Date('2025-01-05T14:00:00'), createdByUser: { firstName: 'Bob', lastName: 'Jones' } },
      { id: '5', type: 'WHATSAPP', createdAt: new Date('2025-01-06T16:00:00'), createdByUser: { firstName: 'Alice', lastName: 'Smith' } },
    ];
    mockPrisma.activity.findMany.mockResolvedValue(activities);

    const result = await report.generate(baseParams);

    const totalActivities = result.summary.find(m => m.key === 'totalActivities');
    expect(totalActivities!.value).toBe(5);

    const pieChart = result.charts.find(c => c.type === 'PIE');
    expect(pieChart).toBeDefined();
    expect(pieChart!.labels).toContain('CALL');
    expect(pieChart!.labels).toContain('EMAIL');
    expect(pieChart!.labels).toContain('MEETING');
    expect(pieChart!.labels).toContain('WHATSAPP');
  });

  it('avgPerDay metric: 30 activities over 10-day period equals 3', async () => {
    // Create 30 activities spread over 10 days (Jan 1-10)
    const activities = Array.from({ length: 30 }, (_, i) => ({
      id: `act-${i}`,
      type: 'CALL',
      createdAt: new Date(`2025-01-${String((i % 10) + 1).padStart(2, '0')}T10:00:00`),
      createdByUser: { firstName: 'Alice', lastName: 'Smith' },
    }));
    mockPrisma.activity.findMany.mockResolvedValue(activities);

    const params: ReportParams = {
      dateFrom: new Date('2025-01-01'),
      dateTo: new Date('2025-01-11'), // 10 days span
      tenantId: 'tenant-1',
    };

    const result = await report.generate(params);

    const avgPerDay = result.summary.find(m => m.key === 'avgPerDay');
    expect(avgPerDay!.value).toBe(3);
  });
});

describe('ActivityHeatmapReport', () => {
  let mockPrisma: any;
  let report: ActivityHeatmapReport;

  beforeEach(() => {
    mockPrisma = {
      activity: { findMany: jest.fn(), count: jest.fn() },
    } as any;
(mockPrisma as any).working = mockPrisma;
    report = new ActivityHeatmapReport(mockPrisma);
  });

  it('7x24 grid: HEATMAP chart has 7 datasets (one per day) and peak slot is correct', async () => {
    // Create activities: heavy on Monday 10:00 (day=1, hour=10)
    const monday10 = new Date('2025-01-06T10:00:00'); // Monday
    const tuesday14 = new Date('2025-01-07T14:00:00'); // Tuesday
    const activities = [
      { createdAt: monday10 },
      { createdAt: monday10 },
      { createdAt: monday10 },
      { createdAt: monday10 },
      { createdAt: monday10 },
      { createdAt: tuesday14 },
      { createdAt: tuesday14 },
    ];
    mockPrisma.activity.findMany.mockResolvedValue(activities);

    const result = await report.generate(baseParams);

    const heatmap = result.charts.find(c => c.type === 'HEATMAP');
    expect(heatmap).toBeDefined();
    expect(heatmap!.datasets).toHaveLength(7);

    // Monday = day index 1, hour 10 should have 5 activities
    expect(heatmap!.datasets[1].label).toBe('Monday');
    expect(heatmap!.datasets[1].data[10]).toBe(5);

    // Tuesday = day index 2, hour 14 should have 2 activities
    expect(heatmap!.datasets[2].label).toBe('Tuesday');
    expect(heatmap!.datasets[2].data[14]).toBe(2);

    // Peak time should be Monday 10:00
    const peakMetric = result.summary.find(m => m.key === 'peakTime');
    expect(peakMetric!.value).toBe(5);
    expect(result.metadata!.peakTime).toBe('Monday 10:00');

    expect(result.summary.find(m => m.key === 'totalActivities')!.value).toBe(7);
  });
});
