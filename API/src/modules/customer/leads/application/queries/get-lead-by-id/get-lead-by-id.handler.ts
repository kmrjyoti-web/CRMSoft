import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetLeadByIdQuery } from './get-lead-by-id.query';

@QueryHandler(GetLeadByIdQuery)
export class GetLeadByIdHandler implements IQueryHandler<GetLeadByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeadByIdQuery) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: query.leadId },
      include: {
        contact: {
          select: {
            id: true, firstName: true, lastName: true,
            designation: true, isActive: true,
            communications: {
              where: { isPrimary: true },
              select: { id: true, type: true, value: true },
              take: 3,
            },
          },
        },
        organization: {
          select: {
            id: true, name: true, city: true, industry: true,
          },
        },
        allocatedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true },
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
        activities: {
          select: {
            id: true, type: true, subject: true,
            outcome: true, completedAt: true, scheduledAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        demos: {
          select: {
            id: true, mode: true, status: true,
            scheduledAt: true, completedAt: true,
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        quotations: {
          select: {
            id: true, quotationNo: true, status: true,
            totalAmount: true, validUntil: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { activities: true, demos: true, quotations: true },
        },
      },
    });

    if (!lead) throw new NotFoundException(`Lead ${query.leadId} not found`);

    // Add valid next statuses for UI
    const { LeadStatus } = await import('../../../domain/value-objects/lead-status.vo');
    const currentStatus = LeadStatus.fromString(lead.status);

    return {
      ...lead,
      validNextStatuses: currentStatus.validTransitions(),
      isTerminal: currentStatus.isTerminal(),
    };
  }
}
