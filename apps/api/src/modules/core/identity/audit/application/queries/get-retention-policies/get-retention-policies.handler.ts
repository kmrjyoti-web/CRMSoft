import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetRetentionPoliciesQuery } from './get-retention-policies.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@QueryHandler(GetRetentionPoliciesQuery)
export class GetRetentionPoliciesHandler implements IQueryHandler<GetRetentionPoliciesQuery> {
    private readonly logger = new Logger(GetRetentionPoliciesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetRetentionPoliciesQuery) {
    try {
      return this.prisma.identity.auditRetentionPolicy.findMany({
        orderBy: { entityType: 'asc' },
      });
    } catch (error) {
      this.logger.error(`GetRetentionPoliciesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
