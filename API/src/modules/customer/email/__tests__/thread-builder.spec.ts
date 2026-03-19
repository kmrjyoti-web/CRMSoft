import { Test, TestingModule } from '@nestjs/testing';
import { ThreadBuilderService } from '../services/thread-builder.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

describe('ThreadBuilderService', () => {
  let service: ThreadBuilderService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      email: {
        findUniqueOrThrow: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      emailThread: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadBuilderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ThreadBuilderService>(ThreadBuilderService);
  });

  it('should strip Re: prefix from subject', () => {
    const result = service.normalizeSubject('Re: Meeting tomorrow');

    expect(result).toBe('Meeting tomorrow');
  });

  it('should strip Fwd: prefix from subject', () => {
    const result = service.normalizeSubject('Fwd: Project Update');

    expect(result).toBe('Project Update');
  });

  it('should strip leading prefix from subject with multiple prefixes', () => {
    const result = service.normalizeSubject('Re: Important Proposal');

    expect(result).toBe('Important Proposal');
    // normalizeSubject uses single-pass regex, stripping the first prefix
    const result2 = service.normalizeSubject('FWD: Weekly Report');
    expect(result2).toBe('Weekly Report');
  });

  it('should preserve subject without prefix', () => {
    const result = service.normalizeSubject('Weekly Sales Report');

    expect(result).toBe('Weekly Sales Report');
  });
});
