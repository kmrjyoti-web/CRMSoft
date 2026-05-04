import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetApprovalByIdQuery } from './get-approval-by-id.query';

@QueryHandler(GetApprovalByIdQuery)
export class GetApprovalByIdHandler implements IQueryHandler<GetApprovalByIdQuery> {
    private readonly logger = new Logger(GetApprovalByIdHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetApprovalByIdQuery) {
    try {
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
    } catch (error) {
      this.logger.error(`GetApprovalByIdHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
