import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { GetLookupByIdQuery } from './get-lookup-by-id.query';

@QueryHandler(GetLookupByIdQuery)
export class GetLookupByIdHandler implements IQueryHandler<GetLookupByIdQuery> {
  private readonly logger = new Logger(GetLookupByIdHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(query: GetLookupByIdQuery) {
    try {
      const lookup = await this.prisma!.platform.masterLookup.findUnique({
        where: { id: query.lookupId },
        include: {
          values: {
            where: { isActive: true },
            orderBy: { rowIndex: 'asc' },
            include: {
              children: { where: { isActive: true }, orderBy: { rowIndex: 'asc' } },
            },
          },
        },
      });
      if (!lookup) throw new NotFoundException(`Lookup ${query.lookupId} not found`);
      return lookup;
    } catch (error) {
      this.logger.error(`GetLookupByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
