import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSalesFunnelQuery } from './get-sales-funnel.query';
import { PipelineService } from '../../../services/pipeline.service';

@QueryHandler(GetSalesFunnelQuery)
export class GetSalesFunnelHandler implements IQueryHandler<GetSalesFunnelQuery> {
  constructor(private readonly pipelineService: PipelineService) {}

  async execute(query: GetSalesFunnelQuery) {
    return this.pipelineService.getSalesFunnel({
      dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
    });
  }
}
