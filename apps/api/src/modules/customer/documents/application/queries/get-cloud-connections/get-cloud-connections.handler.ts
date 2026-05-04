import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetCloudConnectionsQuery } from './get-cloud-connections.query';
import { CloudProviderService } from '../../../services/cloud-provider.service';

@QueryHandler(GetCloudConnectionsQuery)
export class GetCloudConnectionsHandler implements IQueryHandler<GetCloudConnectionsQuery> {
    private readonly logger = new Logger(GetCloudConnectionsHandler.name);

  constructor(private readonly cloudProvider: CloudProviderService) {}

  async execute(query: GetCloudConnectionsQuery) {
    try {
      return this.cloudProvider.getConnections(query.userId);
    } catch (error) {
      this.logger.error(`GetCloudConnectionsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
