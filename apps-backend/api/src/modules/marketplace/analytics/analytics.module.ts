import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { AnalyticsController } from './presentation/analytics.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { TrackEventHandler } from './application/commands/track-event/track-event.handler';
import { GetAnalyticsHandler } from './application/queries/get-analytics/get-analytics.handler';
import { AnalyticsAggregatorProcessor, ANALYTICS_QUEUE } from './application/jobs/analytics-aggregator.processor';

const CommandHandlers = [TrackEventHandler];
const QueryHandlers = [GetAnalyticsHandler];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: ANALYTICS_QUEUE }),
  ],
  controllers: [AnalyticsController],
  providers: [
    MktPrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
    AnalyticsAggregatorProcessor,
  ],
})
export class AnalyticsModule {}
