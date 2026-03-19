import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetLookupByIdQuery } from './get-lookup-by-id.query';

@QueryHandler(GetLookupByIdQuery)
export class GetLookupByIdHandler implements IQueryHandler<GetLookupByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLookupByIdQuery) {
    const lookup = await this.prisma.masterLookup.findUnique({
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
  }
}
