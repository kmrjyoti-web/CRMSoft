import { NotFoundException } from '@nestjs/common';
import { SubmitQuoteHandler } from '../application/commands/submit-quote/submit-quote.handler';
import { SubmitQuoteCommand } from '../application/commands/submit-quote/submit-quote.command';

describe('SubmitQuoteHandler', () => {
  let handler: SubmitQuoteHandler;
  let mockMktPrisma: any;

  const mockRequirement = {
    id: 'req-1',
    tenantId: 'tenant-1',
    listingType: 'REQUIREMENT',
    isDeleted: false,
    authorId: 'buyer-1',
  };

  beforeEach(() => {
    mockMktPrisma = {
      client: {
        mktListing: {
          findFirst: jest.fn(),
        },
        mktRequirementQuote: {
          create: jest.fn(),
        },
      },
    };
    handler = new SubmitQuoteHandler(mockMktPrisma);
  });

  it('creates a quote when requirement exists', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(mockRequirement);
    mockMktPrisma.client.mktRequirementQuote.create.mockResolvedValue({
      id: 'quote-1',
      requirementId: 'req-1',
      sellerId: 'seller-1',
      tenantId: 'tenant-1',
      pricePerUnit: 1000,
      quantity: 100,
      deliveryDays: 7,
      status: 'SUBMITTED',
    });

    const command = new SubmitQuoteCommand(
      'req-1',
      'seller-1',
      'tenant-1',
      1000,
      100,
      7,
      30,
      'Ready stock available',
      ['ISO9001'],
    );

    const result = await handler.execute(command);
    expect(result).toBe('quote-1');
    expect(mockMktPrisma.client.mktRequirementQuote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requirementId: 'req-1',
          sellerId: 'seller-1',
          tenantId: 'tenant-1',
          pricePerUnit: 1000,
          quantity: 100,
          deliveryDays: 7,
          creditDays: 30,
          notes: 'Ready stock available',
          certifications: ['ISO9001'],
          status: 'SUBMITTED',
        }),
      }),
    );
  });

  it('throws NotFoundException when requirement does not exist', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(null);

    const command = new SubmitQuoteCommand('nonexistent', 'seller-1', 'tenant-1', 1000, 100, 7);
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow('nonexistent');
    expect(mockMktPrisma.client.mktRequirementQuote.create).not.toHaveBeenCalled();
  });

  it('defaults certifications to empty array when not provided', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(mockRequirement);
    mockMktPrisma.client.mktRequirementQuote.create.mockResolvedValue({ id: 'quote-2' });

    const command = new SubmitQuoteCommand('req-1', 'seller-1', 'tenant-1', 500, 50, 14);
    await handler.execute(command);

    const callArgs = mockMktPrisma.client.mktRequirementQuote.create.mock.calls[0][0];
    expect(callArgs.data.certifications).toEqual([]);
  });

  it('verifies requirement with correct tenantId', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(mockRequirement);
    mockMktPrisma.client.mktRequirementQuote.create.mockResolvedValue({ id: 'quote-3' });

    const command = new SubmitQuoteCommand('req-1', 'seller-1', 'tenant-1', 800, 200, 5);
    await handler.execute(command);

    expect(mockMktPrisma.client.mktListing.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'req-1',
          tenantId: 'tenant-1',
          listingType: 'REQUIREMENT',
        }),
      }),
    );
  });
});
