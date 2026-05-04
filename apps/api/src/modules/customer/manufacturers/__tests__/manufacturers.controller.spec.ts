import { ManufacturersController } from '../presentation/manufacturers.controller';

describe('ManufacturersController', () => {
  let controller: ManufacturersController;
  let prisma: any;

  const mockMfg = {
    id: 'm-1', name: 'Tata Motors', code: 'TATA', country: 'India',
    isActive: true, manufacturerOrganizations: [], manufacturerContacts: [],
  };

  beforeEach(() => {
    prisma = {
      manufacturer: {
        create: jest.fn().mockImplementation((args) => ({ id: 'm-1', ...args.data })),
        findMany: jest.fn().mockResolvedValue([mockMfg]),
        findUniqueOrThrow: jest.fn().mockResolvedValue(mockMfg),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockImplementation((args) => ({ ...mockMfg, ...args.data })),
      },
      manufacturerOrganization: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'mo-1' }),
        update: jest.fn().mockResolvedValue({ id: 'mo-1' }),
        deleteMany: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      manufacturerContact: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'mc-1' }),
        update: jest.fn().mockResolvedValue({ id: 'mc-1' }),
        deleteMany: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    prisma.working = prisma;
    controller = new ManufacturersController(prisma);
  });

  it('creates manufacturer with uppercased code', async () => {
    const result = await controller.create({ name: 'Tata Motors', code: 'tata' } as any);
    expect(result.data!.code).toBe('TATA');
    expect(prisma.manufacturer.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ code: 'TATA' }) }),
    );
  });

  it('lists manufacturers with pagination', async () => {
    const result = await controller.findAll('1', '20');
    expect(result.meta!.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('lists manufacturers with search filter', async () => {
    await controller.findAll('1', '20', 'tata');
    expect(prisma.manufacturer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it('gets manufacturer by ID with relations', async () => {
    const result = await controller.findOne('m-1');
    expect(result.data!.id).toBe('m-1');
    expect(prisma.manufacturer.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'm-1' }, include: expect.any(Object) }),
    );
  });

  it('updates manufacturer', async () => {
    const result = await controller.update('m-1', { name: 'Tata Motors Ltd' } as any);
    expect(result.data!.id).toBe('m-1');
    expect(prisma.manufacturer.update).toHaveBeenCalled();
  });

  it('deactivates manufacturer', async () => {
    prisma.manufacturer.update.mockResolvedValue({ ...mockMfg, isActive: false });
    const result = await controller.deactivate('m-1');
    expect(result.data!.isActive).toBe(false);
    expect(prisma.manufacturer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it('links organization to manufacturer (create path)', async () => {
    const result = await controller.linkOrg('m-1', { organizationId: 'org-1' } as any);
    expect(prisma.manufacturerOrganization.findFirst).toHaveBeenCalled();
    expect(prisma.manufacturerOrganization.create).toHaveBeenCalled();
    expect(result.data!.id).toBe('mo-1');
  });

  it('links organization to manufacturer (update path)', async () => {
    prisma.manufacturerOrganization.findFirst.mockResolvedValue({ id: 'mo-existing' });
    const result = await controller.linkOrg('m-1', { organizationId: 'org-1' } as any);
    expect(prisma.manufacturerOrganization.update).toHaveBeenCalled();
    expect(result.data!.id).toBe('mo-1');
  });

  it('unlinks organization from manufacturer', async () => {
    await controller.unlinkOrg('m-1', 'org-1');
    expect(prisma.manufacturerOrganization.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { manufacturerId: 'm-1', organizationId: 'org-1' } }),
    );
  });

  it('links contact to manufacturer (create path)', async () => {
    const result = await controller.linkContact('m-1', { contactId: 'c-1', role: 'Engineer' } as any);
    expect(prisma.manufacturerContact.create).toHaveBeenCalled();
    expect(result.data!.id).toBe('mc-1');
  });

  it('unlinks contact from manufacturer', async () => {
    await controller.unlinkContact('m-1', 'c-1');
    expect(prisma.manufacturerContact.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { manufacturerId: 'm-1', contactId: 'c-1' } }),
    );
  });
});
