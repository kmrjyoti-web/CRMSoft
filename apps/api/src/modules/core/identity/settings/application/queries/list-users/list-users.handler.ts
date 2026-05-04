import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListUsersQuery } from './list-users.query';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
    private readonly logger = new Logger(ListUsersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListUsersQuery) {
    try {
      const take = Math.min(query.limit, 10000);
      const skip = (query.page - 1) * take;

      const where: any = { tenantId: query.tenantId, isDeleted: false };
      if (query.status) where.status = query.status;
      if (query.userType) where.userType = query.userType;
      if (query.roleId) where.roleId = query.roleId;
      if (query.search) {
        where.OR = [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.identity.user.findMany({
          where, skip, take, orderBy: { createdAt: 'desc' },
          include: { role: true, department: true, designation: true },
        }),
        this.prisma.identity.user.count({ where }),
      ]);

      const safe = data.map(({ password, ...u }: { password?: unknown; [key: string]: unknown }) => u);
      return { data: safe, meta: { total, page: query.page, limit: take } };
    } catch (error) {
      this.logger.error(`ListUsersHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
