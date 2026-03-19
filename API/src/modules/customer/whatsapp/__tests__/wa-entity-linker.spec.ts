import { Test, TestingModule } from '@nestjs/testing';
import { WaEntityLinkerService } from '../services/wa-entity-linker.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaEntityLinkerService', () => {
  let service: WaEntityLinkerService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      communication: {
        findFirst: jest.fn(),
      },
      lead: {
        findFirst: jest.fn(),
      },
      waConversation: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaEntityLinkerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WaEntityLinkerService>(WaEntityLinkerService);
  });

  it('should normalize phone number to last 10 digits', () => {
    expect(service.normalizePhone('91-9876543210')).toBe('9876543210');
    expect(service.normalizePhone('+919876543210')).toBe('9876543210');
    expect(service.normalizePhone('9876543210')).toBe('9876543210');
    expect(service.normalizePhone('0091-98765-43210')).toBe('9876543210');
  });

  it('should link to lead when found', async () => {
    const mockComm = {
      rawContact: {
        contact: { id: 'contact-1' },
      },
    };
    const mockLead = { id: 'lead-1', contactId: 'contact-1', status: 'NEW' };

    prisma.communication.findFirst.mockResolvedValue(mockComm);
    prisma.lead.findFirst.mockResolvedValue(mockLead);

    const result = await service.autoLinkByPhone('conv-1', '919876543210');

    expect(prisma.communication.findFirst).toHaveBeenCalledWith({
      where: {
        type: { in: ['PHONE', 'MOBILE', 'WHATSAPP'] },
        value: { endsWith: '9876543210' },
      },
      include: {
        rawContact: {
          include: { contact: true },
        },
      },
    });
    expect(prisma.lead.findFirst).toHaveBeenCalledWith({
      where: { contactId: 'contact-1', status: { notIn: ['WON', 'LOST'] } },
      orderBy: { createdAt: 'desc' },
    });
    expect(prisma.waConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { linkedEntityType: 'LEAD', linkedEntityId: 'lead-1' },
    });
    expect(result).toEqual({ entityType: 'LEAD', entityId: 'lead-1' });
  });

  it('should link to contact when no lead', async () => {
    const mockComm = {
      rawContact: {
        contact: { id: 'contact-2' },
      },
    };

    prisma.communication.findFirst.mockResolvedValue(mockComm);
    prisma.lead.findFirst.mockResolvedValue(null);

    const result = await service.autoLinkByPhone('conv-1', '919876543210');

    expect(prisma.lead.findFirst).toHaveBeenCalledWith({
      where: { contactId: 'contact-2', status: { notIn: ['WON', 'LOST'] } },
      orderBy: { createdAt: 'desc' },
    });
    expect(prisma.waConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { linkedEntityType: 'CONTACT', linkedEntityId: 'contact-2' },
    });
    expect(result).toEqual({ entityType: 'CONTACT', entityId: 'contact-2' });
  });

  it('should return empty when no match', async () => {
    prisma.communication.findFirst.mockResolvedValue(null);

    const result = await service.autoLinkByPhone('conv-1', '919999999999');

    expect(prisma.waConversation.update).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});
