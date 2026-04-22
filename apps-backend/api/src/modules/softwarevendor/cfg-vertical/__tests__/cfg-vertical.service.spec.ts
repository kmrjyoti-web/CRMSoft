import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CfgVerticalService } from '../cfg-vertical.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

const mockVerticals = [
  {
    id: 'v1',
    code: 'gv',
    name: 'General',
    description: 'Default vertical',
    tablePrefix: 'gv_',
    isActive: true,
    isBuilt: true,
    sortOrder: 1,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    modules: [
      { id: 'm1', verticalId: 'v1', moduleCode: 'usr', isRequired: true, createdAt: new Date() },
      { id: 'm2', verticalId: 'v1', moduleCode: 'cfg', isRequired: true, createdAt: new Date() },
    ],
  },
  {
    id: 'v2',
    code: 'soft',
    name: 'Software Vendor',
    description: 'CRMSoft platform ops',
    tablePrefix: 'soft_',
    isActive: true,
    isBuilt: true,
    sortOrder: 2,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    modules: [
      { id: 'm3', verticalId: 'v2', moduleCode: 'usr', isRequired: true, createdAt: new Date() },
    ],
  },
  {
    id: 'v3',
    code: 'rest',
    name: 'Restaurant',
    description: null,
    tablePrefix: 'rest_',
    isActive: false,
    isBuilt: false,
    sortOrder: 3,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    modules: [],
  },
];

function createMockPrisma() {
  return {
    platform: {
      gvCfgVertical: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  };
}

describe('CfgVerticalService', () => {
  let service: CfgVerticalService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CfgVerticalService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CfgVerticalService);
  });

  describe('listAll', () => {
    it('should return all verticals ordered by sortOrder', async () => {
      prisma.platform.gvCfgVertical.findMany.mockResolvedValue(mockVerticals);
      const result = await service.listAll();
      expect(result).toHaveLength(3);
      expect(prisma.platform.gvCfgVertical.findMany).toHaveBeenCalledWith({
        include: { modules: true },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should return empty array when no verticals exist', async () => {
      prisma.platform.gvCfgVertical.findMany.mockResolvedValue([]);
      const result = await service.listAll();
      expect(result).toEqual([]);
    });
  });

  describe('findActive', () => {
    it('should return only active verticals', async () => {
      const active = mockVerticals.filter((v) => v.isActive);
      prisma.platform.gvCfgVertical.findMany.mockResolvedValue(active);
      const result = await service.findActive();
      expect(result).toHaveLength(2);
      expect(prisma.platform.gvCfgVertical.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { modules: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findBuilt', () => {
    it('should return only built verticals', async () => {
      const built = mockVerticals.filter((v) => v.isBuilt);
      prisma.platform.gvCfgVertical.findMany.mockResolvedValue(built);
      const result = await service.findBuilt();
      expect(result).toHaveLength(2);
      expect(prisma.platform.gvCfgVertical.findMany).toHaveBeenCalledWith({
        where: { isBuilt: true },
        include: { modules: true },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should return empty array when no built verticals', async () => {
      prisma.platform.gvCfgVertical.findMany.mockResolvedValue([]);
      const result = await service.findBuilt();
      expect(result).toEqual([]);
    });
  });

  describe('findByCode', () => {
    it('should return vertical by code with modules', async () => {
      prisma.platform.gvCfgVertical.findUnique.mockResolvedValue(mockVerticals[0]);
      const result = await service.findByCode('gv');
      expect(result.code).toBe('gv');
      expect(result.modules).toHaveLength(2);
      expect(prisma.platform.gvCfgVertical.findUnique).toHaveBeenCalledWith({
        where: { code: 'gv' },
        include: { modules: true },
      });
    });

    it('should throw NotFoundException for unknown code', async () => {
      prisma.platform.gvCfgVertical.findUnique.mockResolvedValue(null);
      await expect(service.findByCode('xyz')).rejects.toThrow(NotFoundException);
    });
  });
});
