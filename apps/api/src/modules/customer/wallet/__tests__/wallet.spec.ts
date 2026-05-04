import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { WalletTransactionService } from '../services/wallet-transaction.service';
import { CouponService } from '../services/coupon.service';

const makeWallet = (overrides = {}) => ({
  id: 'w-1',
  tenantId: 't-1',
  balance: 100,
  promoBalance: 20,
  isActive: true,
  lifetimeCredit: 200,
  lifetimeDebit: 80,
  currency: 'INR',
  tokenRate: 1,
  ...overrides,
});

const makeTransaction = (overrides = {}) => ({
  id: 'wtx-1',
  walletId: 'w-1',
  type: 'DEBIT',
  tokens: 10,
  status: 'WTX_COMPLETED',
  ...overrides,
});

describe('Wallet Module', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      wallet: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      walletTransaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      coupon: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(async (arg: any) => Array.isArray(arg) ? Promise.all(arg) : arg(prisma)),
    };
  });

  afterEach(() => jest.clearAllMocks());

  // ─── WalletService ────────────────────────────────────────────────────────

  describe('WalletService', () => {
    let service: WalletService;
    beforeEach(() => { service = new WalletService(prisma); });

    it('should get or create wallet for a tenant', async () => {
      prisma.wallet.upsert?.mockResolvedValue(makeWallet());
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      const result = await service.getOrCreate('t-1');
      expect(result).toBeDefined();
      expect(result.tenantId).toBe('t-1');
    });

    it('should return balance summary', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      const result = await service.getBalance('t-1');
      expect(result.balance).toBe(100);
      expect(result.promoBalance).toBe(20);
      expect(result.totalAvailable).toBe(120);
    });

    it('should throw BadRequestException when wallet is inactive on ensureSufficientBalance', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet({ isActive: false }));
      await expect(service.ensureSufficientBalance('t-1', 10)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when balance is insufficient', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet({ balance: 5, promoBalance: 0 }));
      await expect(service.ensureSufficientBalance('t-1', 100)).rejects.toThrow(BadRequestException);
    });

    it('should activate a wallet', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet({ isActive: false }));
      prisma.wallet.update.mockResolvedValue(makeWallet({ isActive: true }));
      const result = await service.activate('t-1');
      expect(prisma.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: true } }),
      );
    });

    it('should deactivate a wallet', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet({ isActive: true }));
      prisma.wallet.update.mockResolvedValue(makeWallet({ isActive: false }));
      await service.deactivate('t-1');
      expect(prisma.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
    });
  });

  // ─── WalletTransactionService ─────────────────────────────────────────────

  describe('WalletTransactionService', () => {
    let walletService: WalletService;
    let service: WalletTransactionService;

    beforeEach(() => {
      walletService = new WalletService(prisma);
      service = new WalletTransactionService(prisma, walletService);
    });

    it('should credit tokens to a wallet', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.wallet.update.mockResolvedValue(makeWallet({ balance: 150 }));
      prisma.walletTransaction.create.mockResolvedValue(makeTransaction({ type: 'CREDIT', tokens: 50 }));
      const result = await service.credit('t-1', {
        tokens: 50,
        description: 'Recharge',
        type: 'CREDIT',
      });
      expect(result.transaction.tokens).toBe(50);
      expect(result.newBalance).toBeDefined();
    });

    it('should throw NotFoundException when refunding nonexistent transaction', async () => {
      prisma.walletTransaction.findUnique.mockResolvedValue(null);
      await expect(service.refund('missing-tx')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when refunding non-DEBIT transaction', async () => {
      prisma.walletTransaction.findUnique.mockResolvedValue(
        makeTransaction({ type: 'CREDIT', status: 'WTX_COMPLETED' }),
      );
      await expect(service.refund('wtx-1')).rejects.toThrow(BadRequestException);
    });

    it('should return paginated transaction history', async () => {
      prisma.walletTransaction.findMany.mockResolvedValue([makeTransaction()]);
      prisma.walletTransaction.count.mockResolvedValue(1);
      const result = await service.getHistory('t-1', { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  // ─── CouponService ────────────────────────────────────────────────────────

  describe('CouponService', () => {
    let service: CouponService;
    beforeEach(() => { service = new CouponService(prisma); });

    it('should validate a valid coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        id: 'cp-1',
        code: 'SAVE10',
        type: 'FIXED_TOKENS',
        value: 100,
        isActive: true,
        expiresAt: null,
        maxUses: 100,
        usedCount: 5,
        minRecharge: 0,
      });
      const result = await service.validate('SAVE10', 500);
      expect(result.valid).toBe(true);
      expect(result.bonusTokens).toBe(100);
    });

    it('should return invalid for unknown coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      const result = await service.validate('INVALID');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for expired coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        id: 'cp-2', code: 'EXPIRED', type: 'FIXED_TOKENS', value: 50,
        isActive: true, expiresAt: new Date('2020-01-01'), maxUses: 100, usedCount: 0, minRecharge: 0,
      });
      const result = await service.validate('EXPIRED');
      expect(result.valid).toBe(false);
    });

    it('should throw NotFoundException when updating nonexistent coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', { isActive: false })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting nonexistent coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);
      await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
    });

    it('should create a new coupon', async () => {
      const coupon = { id: 'cp-new', code: 'NEW20', type: 'PERCENTAGE', value: 20, isActive: true };
      prisma.coupon.create.mockResolvedValue(coupon);
      const result = await service.create({ code: 'NEW20', type: 'PERCENTAGE', value: 20 });
      expect(result.code).toBe('NEW20');
    });
  });
});
