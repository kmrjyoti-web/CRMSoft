import { Test, TestingModule } from '@nestjs/testing';
import { WaWindowCheckerService } from '../services/wa-window-checker.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('WaWindowCheckerService', () => {
  let service: WaWindowCheckerService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      waConversation: {
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
(prisma as any).working = prisma;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaWindowCheckerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WaWindowCheckerService>(WaWindowCheckerService);
  });

  it('should return true when window is open', () => {
    // Window expires 1 hour from now
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const result = service.isWindowOpen(futureDate);
    expect(result).toBe(true);
  });

  it('should return false when window expired', () => {
    // Window expired 1 hour ago
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);
    const result = service.isWindowOpen(pastDate);
    expect(result).toBe(false);
  });

  it('should refresh window to +24 hours', async () => {
    const beforeCall = Date.now();

    const expiresAt = await service.refreshWindow('conv-1');

    const afterCall = Date.now();

    // Verify the conversation was updated
    expect(prisma.waConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: {
        windowExpiresAt: expect.any(Date),
        isWindowOpen: true,
      },
    });

    // Verify the returned date is approximately 24 hours from now
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const expectedMin = beforeCall + twentyFourHoursMs;
    const expectedMax = afterCall + twentyFourHoursMs;

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});
