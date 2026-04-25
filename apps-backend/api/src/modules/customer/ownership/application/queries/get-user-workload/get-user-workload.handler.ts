import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetUserWorkloadQuery } from './get-user-workload.query';
import { WorkloadService } from '../../../services/workload.service';

@QueryHandler(GetUserWorkloadQuery)
export class GetUserWorkloadHandler implements IQueryHandler<GetUserWorkloadQuery> {
    private readonly logger = new Logger(GetUserWorkloadHandler.name);

  constructor(private readonly workload: WorkloadService) {}

  async execute(query: GetUserWorkloadQuery) {
    try {
      return this.workload.getUserWorkload(query.userId);
    } catch (error) {
      this.logger.error(`GetUserWorkloadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
