import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCloudConnectionsQuery } from './get-cloud-connections.query';
import { CloudProviderService } from '../../../services/cloud-provider.service';

@QueryHandler(GetCloudConnectionsQuery)
export class GetCloudConnectionsHandler implements IQueryHandler<GetCloudConnectionsQuery> {
  constructor(private readonly cloudProvider: CloudProviderService) {}

  async execute(query: GetCloudConnectionsQuery) {
    return this.cloudProvider.getConnections(query.userId);
  }
}
