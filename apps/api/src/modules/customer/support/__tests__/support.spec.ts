import { SupportTicketService } from '../services/support-ticket.service';

const makeTicket = (overrides = {}) => ({
  id: 'tkt-1',
  ticketNumber: 'TKT-2026-0001',
  tenantId: 't-1',
  subject: 'Login issue',
  status: 'OPEN',
  priority: 'HIGH',
  category: 'TECHNICAL',
  messages: [],
  createdAt: new Date(),
  ...overrides,
});

describe('SupportTicketService', () => {
  let service: SupportTicketService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        supportTicket: {
          create: jest.fn(),
          findMany: jest.fn(),
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          count: jest.fn(),
          aggregate: jest.fn(),
          groupBy: jest.fn(),
        },
        supportTicketMessage: {
          create: jest.fn(),
        },
        errorLog: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      },
    };
    service = new SupportTicketService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a support ticket with auto-generated number', async () => {
      prisma.working.supportTicket.count?.mockResolvedValue(0);
      prisma.working.supportTicket.create.mockResolvedValue(makeTicket());
      const result = await service.create({
        tenantId: 't-1',
        reportedById: 'user-1',
        subject: 'Login issue',
        description: 'Cannot log in',
        category: 'TECHNICAL',
        priority: 'HIGH',
      });
      expect(result).toBeDefined();
      expect(prisma.working.supportTicket.create).toHaveBeenCalledTimes(1);
    });

    it('should include auto context when provided', async () => {
      prisma.working.supportTicket.count?.mockResolvedValue(1);
      prisma.working.supportTicket.create.mockResolvedValue(makeTicket());
      await service.create({
        tenantId: 't-1',
        reportedById: 'user-1',
        subject: 'Error',
        description: 'Page crash',
        category: 'BUG',
        priority: 'CRITICAL',
        autoContext: { browser: 'Chrome', url: '/leads' },
        linkedErrorIds: ['err-1'],
      });
      const createArg = prisma.working.supportTicket.create.mock.calls[0][0].data;
      expect(createArg.autoContext).toBeDefined();
    });
  });

  // ─── findByTenant ─────────────────────────────────────────────────────────

  describe('findByTenant', () => {
    it('should return paginated tickets for tenant', async () => {
      prisma.working.supportTicket.findMany.mockResolvedValue([makeTicket()]);
      prisma.working.supportTicket.count.mockResolvedValue(1);
      const result = await service.findByTenant('t-1', { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.working.supportTicket.findMany.mockResolvedValue([]);
      prisma.working.supportTicket.count.mockResolvedValue(0);
      await service.findByTenant('t-1', { status: 'OPEN' });
      const where = prisma.working.supportTicket.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('OPEN');
    });

    it('should return empty when tenant has no tickets', async () => {
      prisma.working.supportTicket.findMany.mockResolvedValue([]);
      prisma.working.supportTicket.count.mockResolvedValue(0);
      const result = await service.findByTenant('t-999', {});
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  // ─── addMessage ───────────────────────────────────────────────────────────

  describe('addMessage', () => {
    it('should add a message to a ticket', async () => {
      prisma.working.supportTicketMessage.create.mockResolvedValue({
        id: 'msg-1', ticketId: 'tkt-1', message: 'Hello',
      });
      prisma.working.supportTicket.update.mockResolvedValue(makeTicket());
      const result = await service.addMessage('tkt-1', {
        senderId: 'user-1',
        senderType: 'USER',
        message: 'Hello',
      });
      expect(result).toBeDefined();
    });
  });

  // ─── closeTicket ──────────────────────────────────────────────────────────

  describe('closeTicket', () => {
    it('should close a ticket', async () => {
      prisma.working.supportTicket.update.mockResolvedValue(makeTicket({ status: 'CLOSED' }));
      const result = await service.closeTicket('tkt-1');
      expect(prisma.working.supportTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'CLOSED' }) }),
      );
    });
  });

  // ─── rateTicket ───────────────────────────────────────────────────────────

  describe('rateTicket', () => {
    it('should rate a ticket with a score', async () => {
      prisma.working.supportTicket.update.mockResolvedValue(makeTicket({ satisfactionRating: 5 }));
      await service.rateTicket('tkt-1', 5, 'Great support!');
      const updateData = prisma.working.supportTicket.update.mock.calls[0][0].data;
      expect(updateData.satisfactionRating).toBe(5);
    });
  });

  // ─── getStats ─────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('should return ticket statistics', async () => {
      prisma.working.supportTicket.count.mockResolvedValue(10);
      prisma.working.supportTicket.findMany.mockResolvedValue([]);
      prisma.working.supportTicket.aggregate?.mockResolvedValue({ _avg: { satisfactionRating: 4.2 }, _count: { satisfactionRating: 5 } });
      prisma.working.supportTicket.groupBy?.mockResolvedValue([
        { status: 'OPEN', _count: { id: 5 } },
        { status: 'CLOSED', _count: { id: 3 } },
      ]);
      const result = await service.getStats();
      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
    });
  });
});
