import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListQuotationsQuery } from './list-quotations.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(ListQuotationsQuery)
export class ListQuotationsHandler implements IQueryHandler<ListQuotationsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListQuotationsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.leadId) where.leadId = query.leadId;
    if (query.userId) where.createdById = query.userId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = query.dateFrom;
      if (query.dateTo) where.createdAt.lte = query.dateTo;
    }
    if (query.search) {
      where.OR = [
        { quotationNo: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where, skip, take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          lineItems: { select: { id: true, productName: true, lineTotal: true } },
          lead: { select: { id: true, leadNumber: true, contact: { select: { firstName: true, lastName: true } } } },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
