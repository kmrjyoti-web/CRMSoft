import { AutoNumberService } from '../services/auto-number.service';

const mockPrisma = {
  $transaction: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  autoNumberSequence: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
} as any;

describe('AutoNumberService', () => {
  let service: AutoNumberService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AutoNumberService(mockPrisma);
  });

  it('should format "L-2026-00001" correctly', () => {
    const result = service.format('{PREFIX}-{YYYY}-{SEQ:5}', 'L', 1, 5);
    const year = new Date().getFullYear();
    expect(result).toBe(`L-${year}-00001`);
  });

  it('should format "QTN/2602/0045" correctly', () => {
    const result = service.format('{PREFIX}/{YY}{MM}/{SEQ:4}', 'QTN', 45, 4);
    const yy = new Date().getFullYear().toString().slice(-2);
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    expect(result).toBe(`QTN/${yy}${mm}/0045`);
  });

  it('should zero-pad to seqPadding when using {SEQ}', () => {
    const result = service.format('{PREFIX}-{SEQ}', 'X', 7, 6);
    expect(result).toBe('X-000007');
  });

  it('should increment sequence via next()', async () => {
    const seq = {
      id: 'seq-1', tenantId: 't1', entityName: 'Lead', prefix: 'L',
      formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', currentSequence: 5,
      seqPadding: 5, startFrom: 1, incrementBy: 1,
      resetPolicy: 'NEVER', isActive: true, lastResetAt: null, createdAt: new Date(),
    };
    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        $queryRawUnsafe: jest.fn().mockResolvedValue([seq]),
        autoNumberSequence: { update: jest.fn().mockResolvedValue({ ...seq, currentSequence: 6 }) },
      };
      return fn(tx);
    });

    const result = await service.next('t1', 'Lead');
    const year = new Date().getFullYear();
    expect(result).toBe(`L-${year}-00006`);
  });

  it('should detect YEARLY reset when year changes', () => {
    const seq: any = {
      resetPolicy: 'YEARLY',
      lastResetAt: new Date('2025-12-31'),
      createdAt: new Date('2025-01-01'),
    };
    // @ts-ignore - accessing private method
    const shouldReset = (service as any).shouldReset(seq);
    expect(shouldReset).toBe(true);
  });

  it('should detect MONTHLY reset when month changes', () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const seq: any = {
      resetPolicy: 'MONTHLY',
      lastResetAt: lastMonth,
      createdAt: lastMonth,
    };
    const shouldReset = (service as any).shouldReset(seq);
    expect(shouldReset).toBe(true);
  });
});
