import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetQuotationVersionsQuery } from './get-quotation-versions.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetQuotationVersionsQuery)
export class GetQuotationVersionsHandler implements IQueryHandler<GetQuotationVersionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuotationVersionsQuery) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: query.quotationId },
      select: { id: true, parentQuotationId: true },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');

    // Find root of revision chain
    let rootId = quotation.id;
    let current = quotation;
    while (current.parentQuotationId) {
      const parent = await this.prisma.quotation.findUnique({
        where: { id: current.parentQuotationId },
        select: { id: true, parentQuotationId: true },
      });
      if (!parent) break;
      rootId = parent.id;
      current = parent;
    }

    // Get all revisions from root
    const versions = await this.collectVersions(rootId);
    return versions;
  }

  private async collectVersions(id: string): Promise<any[]> {
    const q = await this.prisma.quotation.findUnique({
      where: { id },
      select: {
        id: true, quotationNo: true, version: true, status: true,
        totalAmount: true, createdAt: true,
        revisions: {
          select: { id: true, quotationNo: true, version: true, status: true, totalAmount: true, createdAt: true },
          orderBy: { version: 'asc' },
        },
      },
    });
    if (!q) return [];

    const result = [{ id: q.id, quotationNo: q.quotationNo, version: q.version, status: q.status, totalAmount: q.totalAmount, createdAt: q.createdAt }];
    for (const rev of q.revisions) {
      result.push(rev);
    }
    return result;
  }
}
