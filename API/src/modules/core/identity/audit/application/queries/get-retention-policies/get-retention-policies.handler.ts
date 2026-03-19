import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRetentionPoliciesQuery } from './get-retention-policies.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@QueryHandler(GetRetentionPoliciesQuery)
export class GetRetentionPoliciesHandler implements IQueryHandler<GetRetentionPoliciesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetRetentionPoliciesQuery) {
    return this.prisma.auditRetentionPolicy.findMany({
      orderBy: { entityType: 'asc' },
    });
  }
}
