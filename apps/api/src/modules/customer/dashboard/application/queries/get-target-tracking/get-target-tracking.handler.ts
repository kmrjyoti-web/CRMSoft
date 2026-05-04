import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetTargetTrackingQuery } from './get-target-tracking.query';
import { TargetCalculatorService } from '../../../services/target-calculator.service';

@QueryHandler(GetTargetTrackingQuery)
export class GetTargetTrackingHandler implements IQueryHandler<GetTargetTrackingQuery> {
    private readonly logger = new Logger(GetTargetTrackingHandler.name);

  constructor(private readonly targetCalculator: TargetCalculatorService) {}

  async execute(query: GetTargetTrackingQuery) {
    try {
      return this.targetCalculator.getTargetTracking({
        period: query.period, dateFrom: query.dateFrom, dateTo: query.dateTo,
      });
    } catch (error) {
      this.logger.error(`GetTargetTrackingHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
