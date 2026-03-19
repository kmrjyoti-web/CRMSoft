// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetContactByIdQuery } from './get-contact-by-id.query';

@QueryHandler(GetContactByIdQuery)
export class GetContactByIdHandler implements IQueryHandler<GetContactByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactByIdQuery) {
    const contact = await this.prisma.working.contact.findUnique({
      where: { id: query.contactId },
      include: {
        communications: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          select: {
            id: true, type: true, value: true, priorityType: true,
            isPrimary: true, isVerified: true, label: true,
          },
        },
        contactOrganizations: {
          where: { isActive: true },
          include: {
            organization: {
              select: {
                id: true, name: true, industry: true, city: true, isActive: true,
              },
            },
          },
        },
        leads: {
          select: {
            id: true, leadNumber: true, status: true,
            priority: true, expectedValue: true, createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        filters: {
          include: {
            lookupValue: {
              select: {
                id: true, value: true, label: true,
                lookup: { select: { category: true } },
              },
            },
          },
        },
        rawContacts: {
          select: {
            id: true, status: true, source: true,
            companyName: true, createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        _count: {
          select: { leads: true, communications: true, activities: true },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${query.contactId} not found`);
    }
    return contact;
  }
}
