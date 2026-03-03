import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetOrganizationByIdQuery } from './get-organization-by-id.query';

@QueryHandler(GetOrganizationByIdQuery)
export class GetOrganizationByIdHandler implements IQueryHandler<GetOrganizationByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrganizationByIdQuery) {
    const org = await this.prisma.organization.findUnique({
      where: { id: query.organizationId },
      include: {
        contacts: {
          select: {
            id: true, relationType: true, designation: true, isPrimary: true,
            contact: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          take: 50,
        },
        leads: {
          select: {
            id: true, leadNumber: true, status: true,
            priority: true, expectedValue: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        filters: {
          include: {
            lookupValue: { select: { id: true, value: true, label: true } },
          },
        },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { contacts: true, leads: true } },
      },
    });
    if (!org) throw new NotFoundException(`Organization ${query.organizationId} not found`);
    return org;
  }
}
