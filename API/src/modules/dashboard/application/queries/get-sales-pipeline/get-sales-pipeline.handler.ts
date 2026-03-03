import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSalesPipelineQuery } from './get-sales-pipeline.query';
import { PipelineService } from '../../../services/pipeline.service';

@QueryHandler(GetSalesPipelineQuery)
export class GetSalesPipelineHandler implements IQueryHandler<GetSalesPipelineQuery> {
  constructor(private readonly pipelineService: PipelineService) {}

  async execute(query: GetSalesPipelineQuery) {
    return this.pipelineService.getSalesPipeline({
      dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
    });
  }
}
