import { QuotationPredictionService } from '../../services/quotation-prediction.service';
import { NotFoundException } from '@nestjs/common';

describe('QuotationPredictionService', () => {
  let service: QuotationPredictionService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      lead: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'lead-1', priority: 'HIGH', expectedValue: 100000,
          contact: { designation: 'CTO', department: 'IT' },
          organization: { industry: 'Healthcare', city: 'Mumbai', state: 'Maharashtra' },
          filters: [
            { lookupValue: { value: 'HOT', lookup: { category: 'LEAD_TYPE' } } },
          ],
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            leadNumber: 'LD-001', status: 'WON',
            quotations: [
              {
                id: 'q-1', status: 'ACCEPTED', totalAmount: 90000, discountValue: 10,
                priceType: 'FIXED', paymentTerms: 'Net 30',
                acceptedAt: new Date('2026-01-25'), createdAt: new Date('2026-01-10'),
                rejectedReason: null,
                lineItems: [{ productId: 'p-1', productName: 'CRM License' }],
              },
            ],
          },
          {
            leadNumber: 'LD-002', status: 'LOST',
            quotations: [
              {
                id: 'q-2', status: 'REJECTED', totalAmount: 150000, discountValue: 5,
                priceType: 'FIXED', paymentTerms: null,
                acceptedAt: null, createdAt: new Date('2026-01-05'),
                rejectedReason: 'Too expensive',
                lineItems: [{ productId: 'p-1', productName: 'CRM License' }],
              },
            ],
          },
        ]),
      },
    };
    service = new QuotationPredictionService(prisma);
  });

  it('should return score 0-100 based on lead data', async () => {
    const result = await service.predict('lead-1');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.confidence).toBeDefined();
  });

  it('should give higher score for HIGH priority leads', async () => {
    const highResult = await service.predict('lead-1');

    prisma.lead.findUnique.mockResolvedValue({
      id: 'lead-2', priority: 'LOW', expectedValue: 100000,
      contact: { designation: 'Intern' }, organization: null, filters: [],
    });
    const lowResult = await service.predict('lead-2');

    expect(highResult.score).toBeGreaterThan(lowResult.score);
  });

  it('should suggest products from similar won deals', async () => {
    const result = await service.predict('lead-1');
    expect(result.recommendations.suggestedProducts.length).toBeGreaterThan(0);
    expect(result.recommendations.suggestedProducts[0].name).toBe('CRM License');
  });

  it('should return questions for missing lead data only', async () => {
    const questions = await service.getQuestions('lead-1');
    expect(Array.isArray(questions)).toBe(true);
    // Lead has expectedValue so budget question should not be asked
    const budgetQ = questions.find((q: any) => q.id === 'budget');
    expect(budgetQ).toBeUndefined();
  });

  it('should throw NotFoundException for non-existent lead', async () => {
    prisma.lead.findUnique.mockResolvedValue(null);
    await expect(service.predict('bad')).rejects.toThrow(NotFoundException);
  });
});
