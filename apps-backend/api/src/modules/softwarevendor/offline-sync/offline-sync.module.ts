import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { EntityResolverService } from './services/entity-resolver.service';
import { SyncScopeResolverService } from './services/sync-scope-resolver.service';
import { PullService } from './services/pull.service';
import { PushService } from './services/push.service';
import { ConflictResolverService } from './services/conflict-resolver.service';
import { WarningEvaluatorService } from './services/warning-evaluator.service';
import { FlushService } from './services/flush.service';
import { SyncEngineService } from './services/sync-engine.service';
import { SyncAnalyticsService } from './services/sync-analytics.service';
import { SyncSchedulerService } from './services/sync-scheduler.service';

// Controllers
import { SyncController } from './presentation/sync.controller';
import { SyncAdminController } from './presentation/sync-admin.controller';

@Module({
  imports: [ScheduleModule],
  controllers: [SyncController, SyncAdminController],
  providers: [
    EntityResolverService,
    SyncScopeResolverService,
    PullService,
    PushService,
    ConflictResolverService,
    WarningEvaluatorService,
    FlushService,
    SyncEngineService,
    SyncAnalyticsService,
    SyncSchedulerService,
  ],
  exports: [SyncEngineService],
})
export class OfflineSyncModule {}
