import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTargetTrackingQuery } from './get-target-tracking.query';
import { TargetCalculatorService } from '../../../services/target-calculator.service';

@QueryHandler(GetTargetTrackingQuery)
export class GetTargetTrackingHandler implements IQueryHandler<GetTargetTrackingQuery> {
  constructor(private readonly targetCalculator: TargetCalculatorService) {}

  async execute(query: GetTargetTrackingQuery) {
    return this.targetCalculator.getTargetTracking({
      period: query.period, dateFrom: query.dateFrom, dateTo: query.dateTo,
    });
  }
}
