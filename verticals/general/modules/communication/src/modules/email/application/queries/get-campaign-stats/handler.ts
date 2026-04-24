import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EmailAnalyticsService } from '../../../services/email-analytics.service';
import { GetCampaignStatsQuery } from './query';

@QueryHandler(GetCampaignStatsQuery)
export class GetCampaignStatsHandler implements IQueryHandler<GetCampaignStatsQuery> {
  constructor(private readonly emailAnalytics: EmailAnalyticsService) {}

  async execute(query: GetCampaignStatsQuery) {
    return this.emailAnalytics.getCampaignStats(query.campaignId);
  }
}
