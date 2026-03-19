import { Test, TestingModule } from '@nestjs/testing';
import { WaConversationService } from '../services/wa-conversation.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaConversationService', () => {
  let service: WaConversationService;
  let prisma: any;

  const mockConversation = {
    id: 'conv-1',
    wabaId: 'waba-1',
    contactPhone: '919876543210',
    contactName: 'John',
    contactPushName: 'Johnny',
    status: 'OPEN',
  };

  beforeEach(async () => {
    prisma = {
      waConversation: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue(mockConversation),
        update: jest.fn().mockResolvedValue(mockConversation),
      },
      whatsAppBusinessAccount: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaConversationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WaConversationService>(WaConversationService);
  });

  it('should create new conversation if not exists', async () => {
    prisma.waConversation.findFirst.mockResolvedValue(null);

    const result = await service.getOrCreate('waba-1', '919876543210', 'John', 'Johnny');

    expect(prisma.waConversation.findFirst).toHaveBeenCalledWith({
      where: { wabaId: 'waba-1', contactPhone: '919876543210' },
    });
    expect(prisma.waConversation.create).toHaveBeenCalledWith({
      data: {
        wabaId: 'waba-1',
        contactPhone: '919876543210',
        contactName: 'John',
        contactPushName: 'Johnny',
        status: 'OPEN',
      },
    });
    expect(prisma.whatsAppBusinessAccount.update).toHaveBeenCalledWith({
      where: { id: 'waba-1' },
      data: { totalConversations: { increment: 1 } },
    });
    expect(result).toEqual(mockConversation);
  });

  it('should return existing conversation', async () => {
    prisma.waConversation.findFirst.mockResolvedValue(mockConversation);

    const result = await service.getOrCreate('waba-1', '919876543210', 'John', 'Johnny');

    expect(prisma.waConversation.findFirst).toHaveBeenCalledWith({
      where: { wabaId: 'waba-1', contactPhone: '919876543210' },
    });
    expect(prisma.waConversation.create).not.toHaveBeenCalled();
    expect(result).toEqual(mockConversation);
  });

  it('should assign conversation', async () => {
    const assignedConv = { ...mockConversation, assignedToId: 'user-1' };
    prisma.waConversation.update.mockResolvedValue(assignedConv);

    const result = await service.assign('conv-1', 'user-1');

    expect(prisma.waConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { assignedToId: 'user-1' },
    });
    expect(result).toEqual(assignedConv);
  });

  it('should resolve conversation', async () => {
    const resolvedConv = { ...mockConversation, status: 'RESOLVED' };
    prisma.waConversation.update.mockResolvedValue(resolvedConv);

    const result = await service.resolve('conv-1');

    expect(prisma.waConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { status: 'RESOLVED' },
    });
    expect(result).toEqual(resolvedConv);
  });
});
