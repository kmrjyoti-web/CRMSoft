import { Test, TestingModule } from '@nestjs/testing';
import { SlaAlertsService } from './sla-alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const mockPrisma = {
  partnerDevRequest: { findMany: jest.fn(), count: jest.fn() },
  partnerInvoice: { findMany: jest.fn(), update: jest.fn(), count: jest.fn() },
  slaAlert: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
};
const mockAudit = { log: jest.fn() };

describe('SlaAlertsService', () => {
  let service: SlaAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaAlertsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get(SlaAlertsService);
    jest.clearAllMocks();
  });

  describe('checkSlaBreaches', () => {
    it('should create breach alerts for overdue requests not yet alerted', async () => {
      mockPrisma.partnerDevRequest.findMany.mockResolvedValue([
        { id: 'req-1', title: 'Test Feature', partnerId: 'p-1', status: 'IN_PROGRESS', dueDate: new Date('2026-01-01'), partner: { companyName: 'AcmeCorp', email: 'a@b.com' } },
      ]);
      mockPrisma.slaAlert.findUnique.mockResolvedValue(null);
      mockPrisma.slaAlert.create.mockResolvedValue({});
      mockAudit.log.mockResolvedValue({});

      await service.checkSlaBreaches();

      expect(mockPrisma.slaAlert.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ alertType: 'BREACH', requestId: 'req-1' }) }),
      );
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'SLA_BREACH_DETECTED' }));
    });

    it('should skip already-alerted breaches', async () => {
      mockPrisma.partnerDevRequest.findMany.mockResolvedValue([
        { id: 'req-2', title: 'Old', partnerId: 'p-1', status: 'IN_PROGRESS', dueDate: new Date('2026-01-01'), partner: { companyName: 'X', email: 'x@y.com' } },
      ]);
      mockPrisma.slaAlert.findUnique.mockResolvedValue({ id: 'alert-existing' });

      await service.checkSlaBreaches();

      expect(mockPrisma.slaAlert.create).not.toHaveBeenCalled();
    });

    it('should skip delivered/accepted requests', async () => {
      mockPrisma.partnerDevRequest.findMany.mockResolvedValue([]);
      await service.checkSlaBreaches();
      expect(mockPrisma.slaAlert.create).not.toHaveBeenCalled();
    });
  });

  describe('checkPaymentOverdue', () => {
    it('should mark SENT invoices past due date as OVERDUE', async () => {
      mockPrisma.partnerInvoice.findMany.mockResolvedValue([
        { id: 'inv-1', invoiceNumber: 'WL-INV-2026-0001', partnerId: 'p-1', status: 'SENT', dueDate: new Date('2026-01-01'), totalAmount: 1000, partner: { companyName: 'Acme' } },
      ]);
      mockPrisma.partnerInvoice.update.mockResolvedValue({});
      mockPrisma.slaAlert.findUnique.mockResolvedValue(null);
      mockPrisma.slaAlert.create.mockResolvedValue({});
      mockAudit.log.mockResolvedValue({});

      await service.checkPaymentOverdue();

      expect(mockPrisma.partnerInvoice.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'OVERDUE' } }),
      );
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'INVOICE_OVERDUE' }));
    });

    it('should not create duplicate overdue alerts', async () => {
      mockPrisma.partnerInvoice.findMany.mockResolvedValue([
        { id: 'inv-2', invoiceNumber: 'WL-INV-2026-0002', partnerId: 'p-1', status: 'SENT', dueDate: new Date('2026-01-01'), totalAmount: 500, partner: { companyName: 'Acme' } },
      ]);
      mockPrisma.partnerInvoice.update.mockResolvedValue({});
      mockPrisma.slaAlert.findUnique.mockResolvedValue({ id: 'existing-alert' });

      await service.checkPaymentOverdue();

      expect(mockPrisma.slaAlert.create).not.toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('should return aggregated SLA dashboard stats', async () => {
      mockPrisma.slaAlert.count
        .mockResolvedValueOnce(5)   // totalBreaches
        .mockResolvedValueOnce(3)   // warnings24h
        .mockResolvedValueOnce(2)   // overdueInvoices
        .mockResolvedValueOnce(1);  // upcomingIn24h
      mockPrisma.partnerDevRequest.count
        .mockResolvedValueOnce(4)   // overdueRequests
        .mockResolvedValueOnce(1);  // upcomingIn24h check
      mockPrisma.slaAlert.findMany.mockResolvedValue([]);

      const result = await service.getDashboard();

      expect(result.totalBreaches).toBe(5);
      expect(result.warnings24h).toBe(3);
      expect(result.overdueInvoices).toBe(2);
    });
  });
});
