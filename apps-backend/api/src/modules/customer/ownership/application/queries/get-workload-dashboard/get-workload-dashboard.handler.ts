import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetWorkloadDashboardQuery } from './get-workload-dashboard.query';
import { WorkloadService } from '../../../services/workload.service';

@QueryHandler(GetWorkloadDashboardQuery)
export class GetWorkloadDashboardHandler implements IQueryHandler<GetWorkloadDashboardQuery> {
    private readonly logger = new Logger(GetWorkloadDashboardHandler.name);

  constructor(private readonly workload: WorkloadService) {}

  async execute(query: GetWorkloadDashboardQuery) {
    try {
      return this.workload.getDashboard({ roleId: query.roleId });
    } catch (error) {
      this.logger.error(`GetWorkloadDashboardHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
