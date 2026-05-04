import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetRowDetailQuery } from './get-row-detail.query';

@QueryHandler(GetRowDetailQuery)
export class GetRowDetailHandler implements IQueryHandler<GetRowDetailQuery> {
    private readonly logger = new Logger(GetRowDetailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRowDetailQuery) {
    try {
      return this.prisma.working.importRow.findUniqueOrThrow({
        where: { id: query.rowId },
      });
    } catch (error) {
      this.logger.error(`GetRowDetailHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
