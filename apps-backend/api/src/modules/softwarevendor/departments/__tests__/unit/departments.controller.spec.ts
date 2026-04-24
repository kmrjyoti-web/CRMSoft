import { DepartmentsController } from '../../presentation/departments.controller';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      department: {
        create: jest.fn().mockImplementation((args) => ({ id: 'dept-1', ...args.data })),
        findMany: jest.fn().mockResolvedValue([]),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'dept-1', name: 'SALES', code: 'SALES', displayName: 'Sales',
          parent: null, children: [], headUser: null, designations: [],
        }),
        findUnique: jest.fn().mockResolvedValue({ id: 'p1', path: '/COMPANY' }),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockImplementation((args) => ({ id: args.where.id, ...args.data })),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    controller = new DepartmentsController(prisma);
  });

  it('should create a department with auto-path', async () => {
    const result = await controller.create({
      name: 'North Sales', displayName: 'North Sales', code: 'NORTH_SALES',
      parentId: 'p1',
    });
    expect(result.data!.code).toBe('NORTH_SALES');
    expect(prisma.department.create).toHaveBeenCalled();
    const createArgs = prisma.department.create.mock.calls[0][0];
    expect(createArgs.data.path).toBe('/COMPANY/NORTH_SALES');
  });

  it('should list departments with pagination', async () => {
    prisma.department.findMany.mockResolvedValue([{ id: 'd1' }]);
    prisma.department.count.mockResolvedValue(1);
    const result = await controller.findAll('1', '20');
    expect(result.meta!.total).toBe(1);
  });

  it('should build tree structure', async () => {
    prisma.department.findMany.mockResolvedValue([
      { id: 'root', parentId: null, level: 0, isActive: true, headUser: null },
      { id: 'child', parentId: 'root', level: 1, isActive: true, headUser: null },
    ]);
    const result = await controller.getTree();
    expect(result.data!.length).toBe(1);
    expect((result.data as any[])[0].children.length).toBe(1);
  });

  it('should get department by ID', async () => {
    const result = await controller.findOne('dept-1');
    expect(result.data!.code).toBe('SALES');
  });

  it('should deactivate department', async () => {
    const result = await controller.deactivate('dept-1');
    expect(result.data!.isActive).toBe(false);
  });

  it('should set department head', async () => {
    const result = await controller.setHead('dept-1', 'user-1');
    expect(prisma.department.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { headUserId: 'user-1' } }),
    );
  });

  it('should get users in department', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1', firstName: 'John' }]);
    const result = await controller.getUsers('dept-1');
    expect(result.data!.length).toBe(1);
  });
});
