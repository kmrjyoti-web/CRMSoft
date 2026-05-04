import { NotFoundException } from '@nestjs/common';
import { ListUsersHandler } from '../../application/queries/list-users/list-users.handler';
import { ListUsersQuery } from '../../application/queries/list-users/list-users.query';
import { GetUserHandler } from '../../application/queries/get-user/get-user.handler';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { ListRolesHandler } from '../../application/queries/list-roles/list-roles.handler';
import { ListRolesQuery } from '../../application/queries/list-roles/list-roles.query';
import { GetRoleHandler } from '../../application/queries/get-role/get-role.handler';
import { GetRoleQuery } from '../../application/queries/get-role/get-role.query';
import { ListPermissionsHandler } from '../../application/queries/list-permissions/list-permissions.handler';
import { ListPermissionsQuery } from '../../application/queries/list-permissions/list-permissions.query';

const mockUser = { id: 'u1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com', password: 'hashed', role: { id: 'r1', name: 'ADMIN' }, department: null, designation: null };
const mockRole = { id: 'r1', name: 'ADMIN', displayName: 'Admin', tenantId: 't1', level: 1, permissions: [{ permission: { id: 'p1', module: 'leads', action: 'read' } }], _count: { users: 3 } };

describe('Settings Query Handlers (identity DB)', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      identity: {
        user: {
          findMany: jest.fn().mockResolvedValue([mockUser]),
          count: jest.fn().mockResolvedValue(1),
          findFirst: jest.fn().mockResolvedValue(mockUser),
        },
        role: {
          findMany: jest.fn().mockResolvedValue([mockRole]),
          findFirst: jest.fn().mockResolvedValue(mockRole),
        },
        permission: {
          findMany: jest.fn().mockResolvedValue([{ id: 'p1', module: 'leads', action: 'read' }]),
        },
      },
    };
  });

  describe('ListUsersHandler', () => {
    it('should list users without password', async () => {
      const handler = new ListUsersHandler(prisma);
      const result = await handler.execute(new ListUsersQuery('t1', 1, 50));

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password');
      expect(result.meta.total).toBe(1);
      expect(prisma.identity.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: 't1', isDeleted: false }) }),
      );
    });

    it('should apply search filter', async () => {
      const handler = new ListUsersHandler(prisma);
      await handler.execute(new ListUsersQuery('t1', 1, 50, 'raj'));

      expect(prisma.identity.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });

    it('should cap limit at 10000', async () => {
      const handler = new ListUsersHandler(prisma);
      await handler.execute(new ListUsersQuery('t1', 1, 99999));

      expect(prisma.identity.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10000 }),
      );
    });
  });

  describe('GetUserHandler', () => {
    it('should return user without password', async () => {
      const handler = new GetUserHandler(prisma);
      const result = await handler.execute(new GetUserQuery('u1', 't1'));

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe('u1');
    });

    it('should throw NotFoundException for missing user', async () => {
      prisma.identity.user.findFirst.mockResolvedValue(null);
      const handler = new GetUserHandler(prisma);

      await expect(handler.execute(new GetUserQuery('bad-id', 't1'))).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListRolesHandler', () => {
    it('should list roles for tenant', async () => {
      const handler = new ListRolesHandler(prisma);
      const result = await handler.execute(new ListRolesQuery('t1'));

      expect(result).toHaveLength(1);
      expect(prisma.identity.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
    });

    it('should apply search filter', async () => {
      const handler = new ListRolesHandler(prisma);
      await handler.execute(new ListRolesQuery('t1', 'admin'));

      expect(prisma.identity.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
      );
    });
  });

  describe('GetRoleHandler', () => {
    it('should return role with flattened permissions', async () => {
      const handler = new GetRoleHandler(prisma);
      const result = await handler.execute(new GetRoleQuery('r1', 't1'));

      expect(result.id).toBe('r1');
      expect(result.permissions).toEqual([{ id: 'p1', module: 'leads', action: 'read' }]);
    });

    it('should throw NotFoundException for missing role', async () => {
      prisma.identity.role.findFirst.mockResolvedValue(null);
      const handler = new GetRoleHandler(prisma);

      await expect(handler.execute(new GetRoleQuery('bad', 't1'))).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListPermissionsHandler', () => {
    it('should list all permissions', async () => {
      const handler = new ListPermissionsHandler(prisma);
      const result = await handler.execute(new ListPermissionsQuery());

      expect(result).toHaveLength(1);
      expect(prisma.identity.permission.findMany).toHaveBeenCalled();
    });

    it('should filter by module', async () => {
      const handler = new ListPermissionsHandler(prisma);
      await handler.execute(new ListPermissionsQuery('leads'));

      expect(prisma.identity.permission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ module: 'leads' }) }),
      );
    });
  });
});
