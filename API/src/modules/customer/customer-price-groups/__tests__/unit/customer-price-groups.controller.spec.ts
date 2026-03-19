import { CustomerPriceGroupsController } from '../../presentation/customer-price-groups.controller';

describe('CustomerPriceGroupsController', () => {
  let controller: CustomerPriceGroupsController;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      customerPriceGroup: {
        create: jest.fn().mockImplementation((args) => ({
          id: 'cpg1',
          isActive: true,
          ...args.data,
        })),
        findMany: jest.fn().mockResolvedValue([]),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'cpg1',
          name: 'Wholesale',
          code: 'WHOLESALE',
          isActive: true,
          _count: { customers: 5, prices: 10 },
        }),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockImplementation((args) => ({
          id: args.where.id,
          ...args.data,
        })),
      },
      customerGroupMapping: {
        upsert: jest.fn().mockResolvedValue({ id: 'cgm1' }),
        delete: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
(prisma as any).working = prisma;
    controller = new CustomerPriceGroupsController(prisma);
  });

  it('should create a price group with uppercase code', async () => {
    const result = await controller.create({
      name: 'Wholesale Tier',
      code: 'wholesale',
      description: 'Wholesale pricing group',
      discount: 10,
      priority: 1,
    });

    expect(result.data!.code).toBe('WHOLESALE');
    expect(prisma.customerPriceGroup.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ code: 'WHOLESALE' }),
    });
  });

  it('should list price groups with search', async () => {
    prisma.customerPriceGroup.findMany.mockResolvedValue([
      { id: 'cpg1', name: 'Wholesale', code: 'WHOLESALE' },
    ]);
    prisma.customerPriceGroup.count.mockResolvedValue(1);

    const result = await controller.findAll('1', '20', 'wholesale');

    expect(result.meta!.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(prisma.customerPriceGroup.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'wholesale', mode: 'insensitive' } },
            { code: { contains: 'wholesale', mode: 'insensitive' } },
          ],
        },
      }),
    );
  });

  it('should deactivate a price group', async () => {
    const result = await controller.deactivate('cpg1');

    expect(result.data!.isActive).toBe(false);
    expect(prisma.customerPriceGroup.update).toHaveBeenCalledWith({
      where: { id: 'cpg1' },
      data: { isActive: false },
    });
  });
});
