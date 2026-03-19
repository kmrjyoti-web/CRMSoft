import { PaymentReminderService } from '../services/payment-reminder.service';

const mockPrisma = {
  paymentReminder: {
    createMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};
(mockPrisma as any).working = mockPrisma;

describe('PaymentReminderService', () => {
  let service: PaymentReminderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentReminderService(mockPrisma as any);
  });

  it('should schedule 4 reminders (GENTLE, FIRM, URGENT, FINAL)', async () => {
    mockPrisma.paymentReminder.createMany.mockResolvedValue({ count: 4 });

    const dueDate = new Date('2026-03-01');
    await service.scheduleReminders('t1', 'inv1', dueDate);

    expect(mockPrisma.paymentReminder.createMany).toHaveBeenCalled();
    const call = mockPrisma.paymentReminder.createMany.mock.calls[0][0];
    expect(call.data).toHaveLength(4);
    expect(call.data[0].level).toBe('GENTLE');
    expect(call.data[1].level).toBe('FIRM');
    expect(call.data[2].level).toBe('URGENT');
    expect(call.data[3].level).toBe('FINAL');
  });

  it('should schedule reminders with correct dates', async () => {
    mockPrisma.paymentReminder.createMany.mockResolvedValue({ count: 4 });

    const dueDate = new Date('2026-03-01');
    await service.scheduleReminders('t1', 'inv1', dueDate);

    const data = mockPrisma.paymentReminder.createMany.mock.calls[0][0].data;
    // GENTLE: 3 days after due → March 4
    expect(data[0].scheduledAt.getDate()).toBe(4);
    // FIRM: 7 days after due → March 8
    expect(data[1].scheduledAt.getDate()).toBe(8);
    // URGENT: 15 days → March 16
    expect(data[2].scheduledAt.getDate()).toBe(16);
    // FINAL: 30 days → March 31
    expect(data[3].scheduledAt.getDate()).toBe(31);
  });

  it('should process due reminders and mark as sent', async () => {
    mockPrisma.paymentReminder.findMany.mockResolvedValue([
      {
        id: 'r1', level: 'GENTLE', isSent: false,
        invoice: { invoiceNo: 'INV-001', billingName: 'Customer', balanceAmount: 5000, dueDate: new Date() },
      },
    ]);
    mockPrisma.paymentReminder.update.mockResolvedValue({});

    const results = await service.processDueReminders('t1');
    expect(results).toHaveLength(1);
    expect(results[0].sent).toBe(true);
    expect(mockPrisma.paymentReminder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isSent: true }),
      }),
    );
  });

  it('should cancel pending reminders for an invoice', async () => {
    mockPrisma.paymentReminder.deleteMany.mockResolvedValue({ count: 2 });

    const count = await service.cancelReminders('t1', 'inv1');
    expect(count).toBe(2);
    expect(mockPrisma.paymentReminder.deleteMany).toHaveBeenCalledWith({
      where: { tenantId: 't1', invoiceId: 'inv1', isSent: false },
    });
  });
});
