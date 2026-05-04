import { Test, TestingModule } from '@nestjs/testing';
import { PricingAccessService } from '../services/pricing-access.service';
import { VerificationService } from '../services/verification.service';

describe('PricingAccessService', () => {
  let service: PricingAccessService;

  const B2B_TIERS = [
    { minQty: 1, maxQty: 10, pricePerUnit: 100 },
    { minQty: 11, maxQty: 50, pricePerUnit: 95 },
    { minQty: 51, maxQty: null, pricePerUnit: 85 },
  ];

  const mockVerificationService = {
    getVerificationStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingAccessService,
        { provide: VerificationService, useValue: mockVerificationService },
      ],
    }).compile();

    service = module.get(PricingAccessService);
    jest.clearAllMocks();
  });

  describe('getPricingForUser', () => {
    it('should show B2C price for guest user', async () => {
      const result = await service.getPricingForUser(null, 120, B2B_TIERS);

      expect(result.showB2BPricing).toBe(false);
      expect(result.b2cPrice).toBe(120);
      expect(result.b2bTiers).toBeUndefined();
      expect(result.message).toContain('Login');
    });

    it('should show B2C price for individual user', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'INDIVIDUAL',
        canSeeB2BPricing: false,
      });

      const result = await service.getPricingForUser('user-1', 120, B2B_TIERS);

      expect(result.showB2BPricing).toBe(false);
      expect(result.b2cPrice).toBe(120);
      expect(result.message).toContain('Register as a business');
    });

    it('should show B2B tiers for verified business user', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'BUSINESS',
        canSeeB2BPricing: true,
      });

      const result = await service.getPricingForUser('user-1', 120, B2B_TIERS);

      expect(result.showB2BPricing).toBe(true);
      expect(result.b2bTiers).toHaveLength(3);
      expect(result.b2cPrice).toBe(120);
    });

    it('should prompt GST verification for unverified business', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'BUSINESS',
        canSeeB2BPricing: false,
      });

      const result = await service.getPricingForUser('user-1', 120, B2B_TIERS);

      expect(result.showB2BPricing).toBe(false);
      expect(result.message).toContain('Verify your GST');
    });

    it('should handle null B2B tiers', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'BUSINESS',
        canSeeB2BPricing: true,
      });

      const result = await service.getPricingForUser('user-1', 120, null);

      expect(result.showB2BPricing).toBe(false);
    });
  });

  describe('calculatePrice', () => {
    it('should use B2C price for guest user', async () => {
      const result = await service.calculatePrice(null, 10, 120, B2B_TIERS);

      expect(result.unitPrice).toBe(120);
      expect(result.totalPrice).toBe(1200);
    });

    it('should use B2B tier pricing for verified business', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'BUSINESS',
        canSeeB2BPricing: true,
      });

      const result = await service.calculatePrice('user-1', 25, 120, B2B_TIERS);

      expect(result.unitPrice).toBe(95);
      expect(result.totalPrice).toBe(95 * 25);
      expect(result.tier).toBe('11-50');
    });

    it('should use highest tier for large quantities', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'BUSINESS',
        canSeeB2BPricing: true,
      });

      const result = await service.calculatePrice('user-1', 100, 120, B2B_TIERS);

      expect(result.unitPrice).toBe(85);
      expect(result.totalPrice).toBe(8500);
    });

    it('should use B2C price for individual user regardless of quantity', async () => {
      mockVerificationService.getVerificationStatus.mockResolvedValue({
        registrationType: 'INDIVIDUAL',
        canSeeB2BPricing: false,
      });

      const result = await service.calculatePrice('user-1', 100, 120, B2B_TIERS);

      expect(result.unitPrice).toBe(120);
      expect(result.totalPrice).toBe(12000);
    });
  });
});
