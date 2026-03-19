import { BrandsController } from '../../presentation/brands.controller';

describe('BrandsController', () => {
  let controller: BrandsController;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      brand: {
        create: jest.fn().mockImplementation((args) => ({ id: 'b1', ...args.data })),
        findMany: jest.fn().mockResolvedValue([]),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'b1', name: 'Acme', code: 'ACME',
          brandOrganizations: [], brandContacts: [],
        }),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockImplementation((args) => ({ id: args.where.id, ...args.data })),
      },
      brandOrganization: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'bo1' }),
        update: jest.fn().mockResolvedValue({ id: 'bo1' }),
        deleteMany: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      brandContact: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'bc1' }),
        update: jest.fn().mockResolvedValue({ id: 'bc1' }),
        deleteMany: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    controller = new BrandsController(prisma);
  });

  it('should create a brand with uppercased code', async () => {
    const result = await controller.create({ name: 'Acme Corp', code: 'acme' });
    expect(result.data!.code).toBe('ACME');
  });

  it('should list brands with search', async () => {
    prisma.brand.findMany.mockResolvedValue([{ id: 'b1', name: 'Acme' }]);
    prisma.brand.count.mockResolvedValue(1);
    const result = await controller.findAll('1', '20', 'acme');
    expect(result.meta!.total).toBe(1);
  });

  it('should get brand by ID with relations', async () => {
    const result = await controller.findOne('b1');
    expect(result.data!.code).toBe('ACME');
  });

  it('should deactivate brand', async () => {
    const result = await controller.deactivate('b1');
    expect(result.data!.isActive).toBe(false);
  });

  it('should link organization to brand (create path)', async () => {
    prisma.brandOrganization.findFirst.mockResolvedValue(null);
    const result = await controller.linkOrganization('b1', {
      organizationId: 'org-1',
    });
    expect(result.data!.id).toBe('bo1');
    expect(prisma.brandOrganization.findFirst).toHaveBeenCalled();
    expect(prisma.brandOrganization.create).toHaveBeenCalled();
  });

  it('should link organization to brand (update path)', async () => {
    prisma.brandOrganization.findFirst.mockResolvedValue({ id: 'bo-existing' });
    const result = await controller.linkOrganization('b1', {
      organizationId: 'org-1',
    });
    expect(result.data!.id).toBe('bo1');
    expect(prisma.brandOrganization.findFirst).toHaveBeenCalled();
    expect(prisma.brandOrganization.update).toHaveBeenCalled();
  });

  it('should unlink organization from brand', async () => {
    await controller.unlinkOrganization('b1', 'org-1');
    expect(prisma.brandOrganization.deleteMany).toHaveBeenCalled();
  });

  it('should link contact to brand (create path)', async () => {
    prisma.brandContact.findFirst.mockResolvedValue(null);
    const result = await controller.linkContact('b1', {
      contactId: 'c1', role: 'Manager',
    });
    expect(result.data!.id).toBe('bc1');
    expect(prisma.brandContact.findFirst).toHaveBeenCalled();
    expect(prisma.brandContact.create).toHaveBeenCalled();
  });

  it('should link contact to brand (update path)', async () => {
    prisma.brandContact.findFirst.mockResolvedValue({ id: 'bc-existing' });
    const result = await controller.linkContact('b1', {
      contactId: 'c1', role: 'Manager',
    });
    expect(result.data!.id).toBe('bc1');
    expect(prisma.brandContact.findFirst).toHaveBeenCalled();
    expect(prisma.brandContact.update).toHaveBeenCalled();
  });

  it('should unlink contact from brand', async () => {
    await controller.unlinkContact('b1', 'c1');
    expect(prisma.brandContact.deleteMany).toHaveBeenCalled();
  });
});
