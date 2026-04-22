import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { GetAllLookupsQuery } from './get-all-lookups.query';

@QueryHandler(GetAllLookupsQuery)
export class GetAllLookupsHandler implements IQueryHandler<GetAllLookupsQuery> {
  private readonly logger = new Logger(GetAllLookupsHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(query: GetAllLookupsQuery) {
    try {
      const where: any = {};
      if (query.activeOnly !== false) where.isActive = true;

      return this.prisma!.platform.masterLookup.findMany({
        where,
        orderBy: { category: 'asc' },
        include: {
          _count: { select: { values: true } },
        },
      });
    } catch (error) {
      this.logger.error(`GetAllLookupsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
