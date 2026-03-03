import { TourPlanComplianceReport } from '../reports/tour-plans/tour-plan-compliance.report';
import { VisitOutcomeReport } from '../reports/tour-plans/visit-outcome.report';
import { FieldTeamTrackerReport } from '../reports/tour-plans/field-team-tracker.report';
import { ReportParams } from '../interfaces/report.interface';

const baseParams: ReportParams = {
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  tenantId: 'tenant-1',
};

const mockDrillDown = { getLeads: jest.fn(), getActivities: jest.fn(), getDemos: jest.fn(), getContacts: jest.fn() };

describe('Tour Plan Reports', () => {
  describe('TourPlanComplianceReport', () => {
    it('returns correct report code and category', () => {
      const mockPrisma = {
        tourPlan: { findMany: jest.fn().mockResolvedValue([]) },
      } as any;
      const report = new TourPlanComplianceReport(mockPrisma, mockDrillDown as any);
      expect(report.code).toBe('TOUR_PLAN_COMPLIANCE');
      expect(report.category).toBe('TOUR_PLAN');
    });

    it('calculates compliance rates from tour plans', async () => {
      const mockPlans = [
        {
          id: 't1', planDate: new Date('2025-01-10'), status: 'COMPLETED',
          salesPerson: { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
          visits: [
            { id: 'v1', isCompleted: true, actualArrival: new Date('2025-01-10T09:00:00') },
            { id: 'v2', isCompleted: true, actualArrival: new Date('2025-01-10T11:00:00') },
            { id: 'v3', isCompleted: false, actualArrival: null },
          ],
        },
        {
          id: 't2', planDate: new Date('2025-01-15'), status: 'APPROVED',
          salesPerson: { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
          visits: [
            { id: 'v4', isCompleted: false, actualArrival: null },
          ],
        },
      ];
      const mockPrisma = {
        tourPlan: { findMany: jest.fn().mockResolvedValue(mockPlans) },
      } as any;
      const report = new TourPlanComplianceReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('TOUR_PLAN_COMPLIANCE');
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.summary.find(m => m.key === 'overallCompliance')).toBeDefined();
    });
  });

  describe('VisitOutcomeReport', () => {
    it('analyzes visit outcomes with productive rates', async () => {
      const mockVisits = [
        {
          id: 'v1', outcome: 'PRODUCTIVE', notes: 'Good meeting',
          actualArrival: new Date('2025-01-10T09:00:00'), actualDeparture: new Date('2025-01-10T10:30:00'),
          createdAt: new Date('2025-01-10T09:00:00'),
          tourPlan: { salesPerson: { id: 'u1', firstName: 'A', lastName: 'B' } },
          lead: { organization: { name: 'Corp A' } },
        },
        {
          id: 'v2', outcome: 'NON_PRODUCTIVE', notes: 'Client unavailable',
          actualArrival: new Date('2025-01-10T11:00:00'), actualDeparture: new Date('2025-01-10T11:30:00'),
          createdAt: new Date('2025-01-10T11:00:00'),
          tourPlan: { salesPerson: { id: 'u1', firstName: 'A', lastName: 'B' } },
          lead: { organization: { name: 'Corp B' } },
        },
      ];
      const mockPrisma = {
        tourPlanVisit: { findMany: jest.fn().mockResolvedValue(mockVisits) },
      } as any;
      const report = new VisitOutcomeReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('VISIT_OUTCOME');
      expect(result.summary.find(m => m.key === 'totalVisits')?.value).toBe(2);
    });
  });

  describe('FieldTeamTrackerReport', () => {
    it('tracks field team metrics per user', async () => {
      const mockVisits = [
        {
          id: 'v1', createdAt: new Date('2025-01-10'),
          tourPlan: {
            planDate: new Date('2025-01-10'),
            salesPerson: { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
          },
          lead: { organization: { id: 'org1', name: 'Corp A', city: 'Mumbai' } },
        },
        {
          id: 'v2', createdAt: new Date('2025-01-10'),
          tourPlan: {
            planDate: new Date('2025-01-10'),
            salesPerson: { id: 'u1', firstName: 'Raj', lastName: 'Patel' },
          },
          lead: { organization: { id: 'org2', name: 'Corp B', city: 'Pune' } },
        },
      ];
      const mockPrisma = {
        tourPlanVisit: { findMany: jest.fn().mockResolvedValue(mockVisits) },
      } as any;
      const report = new FieldTeamTrackerReport(mockPrisma, mockDrillDown as any);
      const result = await report.generate(baseParams);

      expect(result.reportCode).toBe('FIELD_TEAM_TRACKER');
      expect(result.tables[0].rows.length).toBe(1); // 1 user
    });
  });
});
