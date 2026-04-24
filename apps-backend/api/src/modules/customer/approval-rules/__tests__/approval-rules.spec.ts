import { ApprovalRulesController } from '../presentation/approval-rules.controller';

const makeRule = (overrides = {}) => ({
  id: 'rule-1',
  entityType: 'QUOTATION',
  action: 'APPROVE',
  checkerRole: 'SALES_MANAGER',
  minCheckers: 1,
  skipForRoles: [],
  amountField: null,
  amountThreshold: null,
  expiryHours: 48,
  ...overrides,
});

describe('ApprovalRulesController', () => {
  let controller: ApprovalRulesController;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      working: {
        approvalRule: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
    };
    controller = new ApprovalRulesController(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create an approval rule with defaults', async () => {
      prisma.working.approvalRule.create.mockResolvedValue(makeRule());
      const result = await controller.create({
        entityType: 'QUOTATION',
        action: 'APPROVE',
        checkerRole: 'SALES_MANAGER',
      } as any);
      expect(result.data).toMatchObject({ entityType: 'QUOTATION' });
      expect(prisma.working.approvalRule.create.mock.calls[0][0].data.minCheckers).toBe(1);
      expect(prisma.working.approvalRule.create.mock.calls[0][0].data.expiryHours).toBe(48);
    });

    it('should create with custom minCheckers and expiryHours', async () => {
      prisma.working.approvalRule.create.mockResolvedValue(makeRule({ minCheckers: 2, expiryHours: 72 }));
      await controller.create({
        entityType: 'PURCHASE_ORDER',
        action: 'APPROVE',
        checkerRole: 'PROCUREMENT_HEAD',
        minCheckers: 2,
        expiryHours: 72,
      } as any);
      const data = prisma.working.approvalRule.create.mock.calls[0][0].data;
      expect(data.minCheckers).toBe(2);
      expect(data.expiryHours).toBe(72);
    });

    it('should create with amount threshold', async () => {
      prisma.working.approvalRule.create.mockResolvedValue(makeRule({ amountField: 'totalValue', amountThreshold: 50000 }));
      await controller.create({
        entityType: 'QUOTATION',
        action: 'APPROVE',
        checkerRole: 'MANAGER',
        amountField: 'totalValue',
        amountThreshold: 50000,
      } as any);
      const data = prisma.working.approvalRule.create.mock.calls[0][0].data;
      expect(data.amountField).toBe('totalValue');
      expect(data.amountThreshold).toBe(50000);
    });
  });

  // ─── list ─────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('should return all approval rules', async () => {
      prisma.working.approvalRule.findMany.mockResolvedValue([makeRule(), makeRule({ id: 'rule-2' })]);
      const result = await controller.list();
      expect(result.data).toHaveLength(2);
      expect(prisma.working.approvalRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should return empty array when no rules exist', async () => {
      prisma.working.approvalRule.findMany.mockResolvedValue([]);
      const result = await controller.list();
      expect(result.data).toEqual([]);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update an approval rule', async () => {
      const updated = makeRule({ minCheckers: 3 });
      prisma.working.approvalRule.update.mockResolvedValue(updated);
      const result = await controller.update('rule-1', { minCheckers: 3 } as any);
      expect((result as any).data.minCheckers).toBe(3);
      expect(prisma.working.approvalRule.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'rule-1' } }),
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete an approval rule', async () => {
      prisma.working.approvalRule.delete.mockResolvedValue({ id: 'rule-1' });
      const result = await controller.remove('rule-1');
      expect(result.data).toBeNull();
      expect(prisma.working.approvalRule.delete).toHaveBeenCalledWith({ where: { id: 'rule-1' } });
    });

    it('should propagate DB error on delete of nonexistent rule', async () => {
      prisma.working.approvalRule.delete.mockRejectedValue(new Error('Record not found'));
      await expect(controller.remove('missing')).rejects.toThrow();
    });
  });
});
