import { PackagesController } from '../../presentation/packages.controller';

describe('PackagesController', () => {
  let controller: PackagesController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      package: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };
(mockPrisma as any).platform = mockPrisma;
    controller = new PackagesController(mockPrisma);
  });

  describe('create', () => {
    it('should create a package with uppercased code', async () => {
      const dto = { name: 'Basic Plan', code: 'basic', price: 999, features: ['CRM'] };
      const created = { id: 'uuid-1', ...dto, code: 'BASIC', isActive: true };
      mockPrisma.package.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(mockPrisma.package.create).toHaveBeenCalledWith({
        data: { ...dto, code: 'BASIC' },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Package created');
      expect(result.data).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return paginated packages', async () => {
      const packages = [
        { id: 'uuid-1', name: 'Basic', code: 'BASIC' },
        { id: 'uuid-2', name: 'Pro', code: 'PRO' },
      ];
      mockPrisma.package.findMany.mockResolvedValue(packages);
      mockPrisma.package.count.mockResolvedValue(2);

      const result = await controller.findAll('1', '20');

      expect(mockPrisma.package.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' },
      });
      expect(mockPrisma.package.count).toHaveBeenCalledWith({ where: {} });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(packages);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
    });

    it('should filter by name/code when search is provided', async () => {
      mockPrisma.package.findMany.mockResolvedValue([]);
      mockPrisma.package.count.mockResolvedValue(0);

      await controller.findAll('1', '20', 'basic');

      const expectedWhere = {
        OR: [
          { name: { contains: 'basic', mode: 'insensitive' } },
          { code: { contains: 'basic', mode: 'insensitive' } },
        ],
      };
      expect(mockPrisma.package.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
      expect(mockPrisma.package.count).toHaveBeenCalledWith({ where: expectedWhere });
    });
  });

  describe('findOne', () => {
    it('should return a single package', async () => {
      const pkg = { id: 'uuid-1', name: 'Basic', code: 'BASIC', isActive: true };
      mockPrisma.package.findUniqueOrThrow.mockResolvedValue(pkg);

      const result = await controller.findOne('uuid-1');

      expect(mockPrisma.package.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(pkg);
    });
  });

  describe('update', () => {
    it('should update a package', async () => {
      const dto = { name: 'Premium Plan', code: 'premium' };
      const updated = { id: 'uuid-1', name: 'Premium Plan', code: 'PREMIUM', isActive: true };
      mockPrisma.package.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-1', dto as any);

      expect(mockPrisma.package.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { name: 'Premium Plan', code: 'PREMIUM' },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Package updated');
      expect(result.data).toEqual(updated);
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false', async () => {
      const deactivated = { id: 'uuid-1', name: 'Basic', code: 'BASIC', isActive: false };
      mockPrisma.package.update.mockResolvedValue(deactivated);

      const result = await controller.deactivate('uuid-1');

      expect(mockPrisma.package.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Package deactivated');
      expect(result.data?.isActive).toBe(false);
    });
  });
});
