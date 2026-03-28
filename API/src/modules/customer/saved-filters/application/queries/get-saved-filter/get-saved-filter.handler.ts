// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetSavedFilterQuery } from './get-saved-filter.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetSavedFilterQuery)
export class GetSavedFilterHandler implements IQueryHandler<GetSavedFilterQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSavedFilterQuery) {
    const filter = await this.prisma.working.savedFilter.findFirst({
      where: { id: query.id, isDeleted: false },
    });
    if (!filter) throw new NotFoundException('SavedFilter not found');
    // Increment usage count
    await this.prisma.working.savedFilter.update({
      where: { id: query.id },
      data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
    });
    return filter;
  }
}
