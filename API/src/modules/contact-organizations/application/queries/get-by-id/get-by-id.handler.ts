import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetContactOrgByIdQuery } from './get-by-id.query';

@QueryHandler(GetContactOrgByIdQuery)
export class GetContactOrgByIdHandler implements IQueryHandler<GetContactOrgByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactOrgByIdQuery) {
    const mapping = await this.prisma.contactOrganization.findUnique({
      where: { id: query.mappingId },
      include: {
        contact: {
          select: {
            id: true, firstName: true, lastName: true,
            designation: true, isActive: true,
          },
        },
        organization: {
          select: {
            id: true, name: true, city: true, industry: true, isActive: true,
          },
        },
      },
    });
    if (!mapping) throw new NotFoundException(`Mapping ${query.mappingId} not found`);
    return mapping;
  }
}
