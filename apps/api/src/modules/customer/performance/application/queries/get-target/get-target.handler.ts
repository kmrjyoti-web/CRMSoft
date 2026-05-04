// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetTargetQuery } from './get-target.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetTargetQuery)
export class GetTargetHandler implements IQueryHandler<GetTargetQuery> {
    private readonly logger = new Logger(GetTargetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTargetQuery) {
    try {
      const target = await this.prisma.working.salesTarget.findFirst({
        where: { id: query.id, isDeleted: false },
      });
      if (!target) throw new NotFoundException('Target not found');
      return target;
    } catch (error) {
      this.logger.error(`GetTargetHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
