import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { GetTestResultsQuery } from './get-test-results.query';
import type { TestType, TestResultStatus } from '@prisma/platform-client';

@QueryHandler(GetTestResultsQuery)
export class GetTestResultsHandler implements IQueryHandler<GetTestResultsQuery> {
    private readonly logger = new Logger(GetTestResultsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTestResultsQuery): Promise<Record<string, unknown>[]> {
    try {
      const { testRunId, filters } = query;
      const { testType, status, module, page = 1, limit = 50 } = filters;

      return this.prisma.platform.testResult.findMany({
        where: {
          testRunId,
          ...(testType ? { testType: testType as TestType } : {}),
          ...(status ? { status: status as TestResultStatus } : {}),
          ...(module ? { module } : {}),
        },
        orderBy: [{ testType: 'asc' }, { suiteName: 'asc' }, { testName: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      this.logger.error(`GetTestResultsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
