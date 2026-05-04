import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListRolesQuery } from './list-roles.query';

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery> {
    private readonly logger = new Logger(ListRolesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListRolesQuery) {
    try {
      const where: any = { tenantId: query.tenantId };
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { displayName: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      return this.prisma.identity.role.findMany({
        where,
        orderBy: { level: 'asc' },
        include: { _count: { select: { users: true } } },
      });
    } catch (error) {
      this.logger.error(`ListRolesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
