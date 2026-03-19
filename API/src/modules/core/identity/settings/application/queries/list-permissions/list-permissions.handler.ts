import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListPermissionsQuery } from './list-permissions.query';

@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler implements IQueryHandler<ListPermissionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListPermissionsQuery) {
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
  }
}
