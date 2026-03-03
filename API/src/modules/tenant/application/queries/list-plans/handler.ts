import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ListPlansQuery } from './query';

@QueryHandler(ListPlansQuery)
export class ListPlansHandler implements IQueryHandler<ListPlansQuery> {
  private readonly logger = new Logger(ListPlansHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListPlansQuery) {
    this.logger.log('Listing plans');

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.plan.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }
}
