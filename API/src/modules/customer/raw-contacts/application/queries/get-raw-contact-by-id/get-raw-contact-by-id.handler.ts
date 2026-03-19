// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetRawContactByIdQuery } from './get-raw-contact-by-id.query';

@QueryHandler(GetRawContactByIdQuery)
export class GetRawContactByIdHandler implements IQueryHandler<GetRawContactByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRawContactByIdQuery) {
    const rc = await this.prisma.rawContact.findUnique({
      where: { id: query.rawContactId },
      include: {
        communications: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true, type: true, value: true, priorityType: true,
            isPrimary: true, isVerified: true, label: true,
          },
        },
        filters: {
          include: {
            lookupValue: { select: { id: true, value: true, label: true } },
          },
        },
        contact: { select: { id: true, firstName: true, lastName: true } },
        verifiedBy: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!rc) throw new NotFoundException(`RawContact ${query.rawContactId} not found`);
    return rc;
  }
}
