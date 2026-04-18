import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListPermissionsQuery } from './list-permissions.query';

@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler implements IQueryHandler<ListPermissionsQuery> {
    private readonly logger = new Logger(ListPermissionsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListPermissionsQuery) {
    try {
      const where: any = {};
      if (query.module) where.module = query.module;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { displayName: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      return this.prisma.identity.permission.findMany({
        where,
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
      });
    } catch (error) {
      this.logger.error(`ListPermissionsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
