import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserWorkloadQuery } from './get-user-workload.query';
import { WorkloadService } from '../../../services/workload.service';

@QueryHandler(GetUserWorkloadQuery)
export class GetUserWorkloadHandler implements IQueryHandler<GetUserWorkloadQuery> {
  constructor(private readonly workload: WorkloadService) {}

  async execute(query: GetUserWorkloadQuery) {
    return this.workload.getUserWorkload(query.userId);
  }
}
