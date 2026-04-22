import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetSalesFunnelQuery } from './get-sales-funnel.query';
import { PipelineService } from '../../../services/pipeline.service';

@QueryHandler(GetSalesFunnelQuery)
export class GetSalesFunnelHandler implements IQueryHandler<GetSalesFunnelQuery> {
    private readonly logger = new Logger(GetSalesFunnelHandler.name);

  constructor(private readonly pipelineService: PipelineService) {}

  async execute(query: GetSalesFunnelQuery) {
    try {
      return this.pipelineService.getSalesFunnel({
        dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
      });
    } catch (error) {
      this.logger.error(`GetSalesFunnelHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
