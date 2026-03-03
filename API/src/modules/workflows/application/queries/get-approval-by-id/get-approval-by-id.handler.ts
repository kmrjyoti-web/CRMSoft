import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetApprovalByIdQuery } from './get-approval-by-id.query';

@QueryHandler(GetApprovalByIdQuery)
export class GetApprovalByIdHandler implements IQueryHandler<GetApprovalByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetApprovalByIdQuery) {
    const approval = await this.prisma.workflowApproval.findUnique({
      where: { id: query.approvalId },
      include: {
        instance: {
          include: {
            workflow: { select: { id: true, name: true, code: true } },
            currentState: { select: { id: true, name: true, code: true } },
          },
        },
        transition: {
          include: {
            fromState: { select: { id: true, name: true, code: true } },
            toState: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
    if (!approval) throw new NotFoundException(`Approval "${query.approvalId}" not found`);
    return approval;
  }
}
