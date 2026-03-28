// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetTargetQuery } from './get-target.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTargetQuery)
export class GetTargetHandler implements IQueryHandler<GetTargetQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTargetQuery) {
    const target = await this.prisma.working.salesTarget.findFirst({
      where: { id: query.id, isDeleted: false },
    });
    if (!target) throw new NotFoundException('Target not found');
    return target;
  }
}
