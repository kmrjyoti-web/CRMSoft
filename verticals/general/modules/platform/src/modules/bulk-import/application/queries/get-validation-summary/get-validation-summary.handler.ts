import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetValidationSummaryQuery } from './get-validation-summary.query';

@QueryHandler(GetValidationSummaryQuery)
export class GetValidationSummaryHandler implements IQueryHandler<GetValidationSummaryQuery> {
    private readonly logger = new Logger(GetValidationSummaryHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetValidationSummaryQuery) {
    try {
      const rows = await this.prisma.working.importRow.findMany({
        where: { importJobId: query.jobId },
        select: { rowStatus: true, validationErrors: true },
      });

      const statusCounts: Record<string, number> = {};
      const topErrors: Record<string, number> = {};

      for (const row of rows) {
        statusCounts[row.rowStatus] = (statusCounts[row.rowStatus] || 0) + 1;

        if (row.validationErrors && Array.isArray(row.validationErrors)) {
          for (const err of row.validationErrors as any[]) {
            const key = `${err.field}: ${err.message}`;
            topErrors[key] = (topErrors[key] || 0) + 1;
          }
        }
      }

      const sortedErrors = Object.entries(topErrors)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([error, count]) => ({ error, count }));

      return { statusCounts, topErrors: sortedErrors, totalRows: rows.length };
    } catch (error) {
      this.logger.error(`GetValidationSummaryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
