import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailAnalyticsService } from '../../../services/email-analytics.service';
import { GetEmailAnalyticsQuery } from './query';

@QueryHandler(GetEmailAnalyticsQuery)
export class GetEmailAnalyticsHandler implements IQueryHandler<GetEmailAnalyticsQuery> {
  constructor(private readonly emailAnalytics: EmailAnalyticsService) {}

  async execute(query: GetEmailAnalyticsQuery) {
    return this.emailAnalytics.getOverallAnalytics(
      query.userId,
      query.dateFrom,
      query.dateTo,
    );
  }
}
