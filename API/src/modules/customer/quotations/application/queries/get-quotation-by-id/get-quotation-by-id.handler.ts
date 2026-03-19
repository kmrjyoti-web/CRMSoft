// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetQuotationByIdQuery } from './get-quotation-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetQuotationByIdQuery)
export class GetQuotationByIdHandler implements IQueryHandler<GetQuotationByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuotationByIdQuery) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: query.id },
      include: {
        lineItems: { orderBy: { sortOrder: 'asc' } },
        sendLogs: { orderBy: { sentAt: 'desc' } },
        negotiations: { orderBy: { loggedAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        lead: { include: { contact: true, organization: true } },
        contactPerson: { select: { id: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } },
        parentQuotation: { select: { id: true, quotationNo: true, status: true } },
        revisions: { select: { id: true, quotationNo: true, version: true, status: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }
}
