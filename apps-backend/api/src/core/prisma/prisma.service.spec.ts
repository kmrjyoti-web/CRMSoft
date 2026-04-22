import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose identity client accessor', () => {
    expect(service.identity).toBeDefined();
  });

  it('should expose platform client accessor', () => {
    expect(service.platform).toBeDefined();
  });

  it('should expose globalReference client accessor', () => {
    expect(service.globalReference).toBeDefined();
  });
});
