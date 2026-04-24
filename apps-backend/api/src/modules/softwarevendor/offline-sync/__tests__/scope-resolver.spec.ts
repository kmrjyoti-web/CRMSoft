import { SyncScopeResolverService } from '../services/sync-scope-resolver.service';

const mockEntityResolver = {
  getEntityConfig: jest.fn(),
};

function makeMockPrisma(user: any = null, department: any = null, departments: any[] = [], teamMembers: any[] = []) {
  return {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      findMany: jest.fn().mockResolvedValue(teamMembers),
    },
    department: {
      findUnique: jest.fn().mockResolvedValue(department),
      findMany: jest.fn().mockResolvedValue(departments),
    },
  } as any;
}

describe('SyncScopeResolverService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('OWNED scope returns user-owned records filter', async () => {
    mockEntityResolver.getEntityConfig.mockReturnValue({
      ownerFields: ['allocatedToId', 'createdById'],
    });

    const prisma = makeMockPrisma();
    const service = new SyncScopeResolverService(prisma, mockEntityResolver as any);

    const scope = await service.resolveScope('user-1', 'Lead', 'OWNED');

    expect(scope).toEqual({
      OR: [
        { allocatedToId: 'user-1' },
        { createdById: 'user-1' },
      ],
    });
  });

  it('TEAM scope returns team member filter via department hierarchy', async () => {
    mockEntityResolver.getEntityConfig.mockReturnValue({
      ownerFields: ['createdById'],
    });

    const user = { departmentId: 'dept-sales' };
    const department = { path: '/COMPANY/SALES' };
    const departments = [
      { id: 'dept-sales' },
      { id: 'dept-sales-north' },
      { id: 'dept-sales-south' },
    ];
    const teamMembers = [
      { id: 'user-1' },
      { id: 'user-2' },
      { id: 'user-3' },
    ];

    const prisma = makeMockPrisma(user, department, departments, teamMembers);
    const service = new SyncScopeResolverService(prisma, mockEntityResolver as any);

    const scope = await service.resolveScope('user-1', 'Contact', 'TEAM');

    expect(scope).toEqual({
      createdById: { in: ['user-1', 'user-2', 'user-3'] },
    });

    // Verify department hierarchy lookup
    expect(prisma.department.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { path: { startsWith: '/COMPANY/SALES' } },
      }),
    );
  });

  it('ALL scope returns empty filter (tenant-wide)', async () => {
    mockEntityResolver.getEntityConfig.mockReturnValue({
      ownerFields: [],
    });

    const prisma = makeMockPrisma();
    const service = new SyncScopeResolverService(prisma, mockEntityResolver as any);

    const scope = await service.resolveScope('user-1', 'LookupValue', 'ALL');

    expect(scope).toEqual({});
  });
});
