import { Test, TestingModule } from '@nestjs/testing';
import { EmailLinkerService } from '../services/email-linker.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('EmailLinkerService', () => {
  let service: EmailLinkerService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      communication: {
        findFirst: jest.fn(),
      },
      lead: {
        findFirst: jest.fn(),
      },
      organization: {
        findUnique: jest.fn(),
      },
      email: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailLinkerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmailLinkerService>(EmailLinkerService);
  });

  it('should autoLink and find lead via communication and link it', async () => {
    const mockComm = {
      rawContact: {
        contact: { id: 'contact-1' },
      },
    };
    const mockLead = { id: 'lead-1', contactId: 'contact-1', status: 'NEW' };

    prisma.communication.findFirst.mockResolvedValue(mockComm);
    prisma.lead.findFirst.mockResolvedValue(mockLead);

    const result = await service.autoLink('email-1', ['john@example.com']);

    expect(prisma.communication.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'EMAIL',
          value: { equals: 'john@example.com', mode: 'insensitive' },
        }),
      }),
    );
    expect(prisma.lead.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ contactId: 'contact-1' }),
      }),
    );
    expect(prisma.email.update).toHaveBeenCalledWith({
      where: { id: 'email-1' },
      data: { linkedEntityType: 'LEAD', linkedEntityId: 'lead-1', autoLinked: true },
    });
    expect(result).toEqual({ entityType: 'LEAD', entityId: 'lead-1' });
  });

  it('should return empty object when no match found in autoLink', async () => {
    prisma.communication.findFirst.mockResolvedValue(null);

    const result = await service.autoLink('email-1', ['unknown@example.com']);

    expect(result).toEqual({});
    expect(prisma.email.update).not.toHaveBeenCalled();
  });

  it('should manualLink and update email entity fields', async () => {
    await service.manualLink('email-1', 'CONTACT', 'contact-99');

    expect(prisma.email.update).toHaveBeenCalledWith({
      where: { id: 'email-1' },
      data: { linkedEntityType: 'CONTACT', linkedEntityId: 'contact-99', autoLinked: false },
    });
  });

  it('should unlink and clear entity fields', async () => {
    await service.unlink('email-1');

    expect(prisma.email.update).toHaveBeenCalledWith({
      where: { id: 'email-1' },
      data: { linkedEntityType: null, linkedEntityId: null, autoLinked: false, activityId: null },
    });
  });
});
