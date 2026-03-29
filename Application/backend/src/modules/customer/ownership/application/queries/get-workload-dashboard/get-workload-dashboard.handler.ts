import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetWorkloadDashboardQuery } from './get-workload-dashboard.query';
import { WorkloadService } from '../../../services/workload.service';

@QueryHandler(GetWorkloadDashboardQuery)
export class GetWorkloadDashboardHandler implements IQueryHandler<GetWorkloadDashboardQuery> {
  constructor(private readonly workload: WorkloadService) {}

  async execute(query: GetWorkloadDashboardQuery) {
    return this.workload.getDashboard({ roleId: query.roleId });
  }
}
