import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateEnquiryHandler } from '../application/commands/create-enquiry/create-enquiry.handler';
import { CreateEnquiryCommand } from '../application/commands/create-enquiry/create-enquiry.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockListing = {
  id: 'listing-1',
  tenantId: 'tenant-1',
  status: 'ACTIVE',
  isDeleted: false,
};

const mockMktPrisma = {
  client: {
    mktListing: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    mktEnquiry: {
      create: jest.fn(),
    },
  },
};

describe('CreateEnquiryHandler', () => {
  let handler: CreateEnquiryHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateEnquiryHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<CreateEnquiryHandler>(CreateEnquiryHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create an enquiry for an active listing', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(mockListing);
    mockMktPrisma.client.mktEnquiry.create.mockResolvedValue({ id: 'enquiry-1', status: 'OPEN' });
    mockMktPrisma.client.mktListing.update.mockResolvedValue({});

    const command = new CreateEnquiryCommand(
      'tenant-1', 'listing-1', 'user-1', 'I need 100 units at Rs 500 each', 100, 500,
    );

    const result = await handler.execute(command);
    expect(typeof result).toBe('string');
    expect(mockMktPrisma.client.mktListing.update).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
      data: { enquiryCount: { increment: 1 } },
    });
  });

  it('should throw NotFoundException for non-active listing', async () => {
    mockMktPrisma.client.mktListing.findFirst.mockResolvedValue(null);

    const command = new CreateEnquiryCommand('tenant-1', 'bad-listing', 'user-1', 'Test message');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
