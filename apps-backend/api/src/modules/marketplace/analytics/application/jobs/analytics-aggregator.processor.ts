import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { randomUUID } from 'crypto';
import { MktPrismaService } from '../../infrastructure/mkt-prisma.service';

export const ANALYTICS_QUEUE = 'marketplace-analytics';

export interface ComputeSummaryJob {
  tenantId: string;
  entityType: 'POST' | 'LISTING' | 'OFFER';
  entityId: string;
}

@Processor(ANALYTICS_QUEUE)
@Injectable()
export class AnalyticsAggregatorProcessor {
  private readonly logger = new Logger(AnalyticsAggregatorProcessor.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  @Process('COMPUTE_SUMMARY')
  async handleComputeSummary(job: Job<ComputeSummaryJob>): Promise<void> {
    const { tenantId, entityType, entityId } = job.data;
    this.logger.log(`Computing analytics summary for ${entityType}/${entityId}`);

    const events = await this.mktPrisma.client.mktAnalyticsEvent.findMany({
      where: { tenantId, entityType: entityType as any, entityId },
    });

    if (events.length === 0) return;

    // Aggregate counts
    const impressions = events.filter((e: any) => e.eventType === 'IMPRESSION').length;
    const clicks = events.filter((e: any) => e.eventType === 'CLICK').length;
    const enquiries = events.filter((e: any) => e.eventType === 'ENQUIRY').length;
    const leads = events.filter((e: any) => e.eventType === 'LEAD').length;
    const orders = events.filter((e: any) => e.eventType === 'ORDER').length;
    const totalOrderValue = events
      .filter((e: any) => e.eventType === 'ORDER' && e.orderValue)
      .reduce((sum: any, e: any) => sum + (e.orderValue ?? 0), 0);

    // Unique counts (by userId)
    const uniqueImpressionUsers = new Set(
      events.filter((e: any) => e.eventType === 'IMPRESSION' && e.userId).map((e: any) => e.userId),
    ).size;
    const uniqueClickUsers = new Set(
      events.filter((e: any) => e.eventType === 'CLICK' && e.userId).map((e: any) => e.userId),
    ).size;

    // Rates
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const enquiryRate = clicks > 0 ? (enquiries / clicks) * 100 : 0;
    const leadConversionRate = enquiries > 0 ? (leads / enquiries) * 100 : 0;
    const orderConversionRate = leads > 0 ? (orders / leads) * 100 : 0;

    // City breakdown
    const cityMap: Record<string, number> = {};
    const stateMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const sourceMap: Record<string, number> = {};
    const hourMap: Record<number, number> = {};

    for (const event of events) {
      if (event.city) cityMap[event.city] = (cityMap[event.city] || 0) + 1;
      if (event.state) stateMap[event.state] = (stateMap[event.state] || 0) + 1;
      if (event.deviceType) deviceMap[event.deviceType] = (deviceMap[event.deviceType] || 0) + 1;
      const src = (event.source as string) || 'FEED';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
      const hour = new Date(event.timestamp).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    }

    const topCities = Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    const topStates = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    const peakHours = Object.entries(hourMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Upsert summary
    const relFields: Record<string, any> = {};
    if (entityType === 'LISTING') relFields.listingId = entityId;
    if (entityType === 'POST') relFields.postId = entityId;
    if (entityType === 'OFFER') relFields.offerId = entityId;

    const existing = await this.mktPrisma.client.mktAnalyticsSummary.findFirst({
      where: { tenantId, entityType: entityType as any, entityId },
    });

    const summaryData = {
      tenantId,
      entityType: entityType as any,
      entityId,
      impressions,
      uniqueImpressions: uniqueImpressionUsers,
      clicks,
      uniqueClicks: uniqueClickUsers,
      ctr: Math.round(ctr * 100) / 100,
      enquiries,
      enquiryRate: Math.round(enquiryRate * 100) / 100,
      leads,
      leadConversionRate: Math.round(leadConversionRate * 100) / 100,
      orders,
      orderConversionRate: Math.round(orderConversionRate * 100) / 100,
      totalOrderValue,
      topCities,
      topStates,
      peakHours,
      deviceBreakdown: deviceMap,
      sourceBreakdown: sourceMap,
      lastComputedAt: new Date(),
      ...relFields,
    };

    if (existing) {
      await this.mktPrisma.client.mktAnalyticsSummary.update({
        where: { id: existing.id },
        data: summaryData,
      });
    } else {
      await this.mktPrisma.client.mktAnalyticsSummary.create({
        data: { id: randomUUID(), ...summaryData },
      });
    }

    this.logger.log(`Summary computed for ${entityType}/${entityId}: impressions=${impressions}, ctr=${ctr.toFixed(2)}%`);
  }
}
