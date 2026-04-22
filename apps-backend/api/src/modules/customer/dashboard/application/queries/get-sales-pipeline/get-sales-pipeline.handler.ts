import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetSalesPipelineQuery } from './get-sales-pipeline.query';
import { PipelineService } from '../../../services/pipeline.service';

@QueryHandler(GetSalesPipelineQuery)
export class GetSalesPipelineHandler implements IQueryHandler<GetSalesPipelineQuery> {
    private readonly logger = new Logger(GetSalesPipelineHandler.name);

  constructor(private readonly pipelineService: PipelineService) {}

  async execute(query: GetSalesPipelineQuery) {
    try {
      return this.pipelineService.getSalesPipeline({
        dateFrom: query.dateFrom, dateTo: query.dateTo, userId: query.userId,
      });
    } catch (error) {
      this.logger.error(`GetSalesPipelineHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
