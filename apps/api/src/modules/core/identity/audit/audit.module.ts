import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { AuditController } from './presentation/audit.controller';
import { AuditAdminController } from './presentation/audit-admin.controller';

// Services
import { AuditCoreService } from './services/audit-core.service';
import { AuditDiffService } from './services/audit-diff.service';
import { AuditSnapshotService } from './services/audit-snapshot.service';
import { AuditEntityResolverService } from './services/audit-entity-resolver.service';
import { AuditSummaryGeneratorService } from './services/audit-summary-generator.service';
import { AuditSanitizerService } from './services/audit-sanitizer.service';
import { AuditExportService } from './services/audit-export.service';
import { AuditCleanupService } from './services/audit-cleanup.service';

// Interceptor
import { AuditInterceptor } from './interceptors/audit.interceptor';

// Command handlers
import { CreateAuditLogHandler } from './application/commands/create-audit-log/create-audit-log.handler';
import { CreateBulkAuditLogHandler } from './application/commands/create-bulk-audit-log/create-bulk-audit-log.handler';
import { UpdateRetentionPolicyHandler } from './application/commands/update-retention-policy/update-retention-policy.handler';
import { CleanupOldLogsHandler } from './application/commands/cleanup-old-logs/cleanup-old-logs.handler';

// Query handlers
import { GetEntityTimelineHandler } from './application/queries/get-entity-timeline/get-entity-timeline.handler';
import { GetGlobalFeedHandler } from './application/queries/get-global-feed/get-global-feed.handler';
import { GetUserActivityHandler } from './application/queries/get-user-activity/get-user-activity.handler';
import { GetFieldHistoryHandler } from './application/queries/get-field-history/get-field-history.handler';
import { GetAuditLogDetailHandler } from './application/queries/get-audit-log-detail/get-audit-log-detail.handler';
import { GetDiffViewHandler } from './application/queries/get-diff-view/get-diff-view.handler';
import { GetAuditStatsHandler } from './application/queries/get-audit-stats/get-audit-stats.handler';
import { SearchAuditLogsHandler } from './application/queries/search-audit-logs/search-audit-logs.handler';
import { GetRetentionPoliciesHandler } from './application/queries/get-retention-policies/get-retention-policies.handler';

const CommandHandlers = [
  CreateAuditLogHandler,
  CreateBulkAuditLogHandler,
  UpdateRetentionPolicyHandler,
  CleanupOldLogsHandler,
];

const QueryHandlers = [
  GetEntityTimelineHandler,
  GetGlobalFeedHandler,
  GetUserActivityHandler,
  GetFieldHistoryHandler,
  GetAuditLogDetailHandler,
  GetDiffViewHandler,
  GetAuditStatsHandler,
  SearchAuditLogsHandler,
  GetRetentionPoliciesHandler,
];

@Global()
@Module({
  imports: [CqrsModule],
  controllers: [AuditController, AuditAdminController],
  providers: [
    AuditCoreService,
    AuditDiffService,
    AuditSnapshotService,
    AuditEntityResolverService,
    AuditSummaryGeneratorService,
    AuditSanitizerService,
    AuditExportService,
    AuditCleanupService,
    AuditInterceptor,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    AuditCoreService,
    AuditSnapshotService,
    AuditEntityResolverService,
    AuditInterceptor,
  ],
})
export class AuditModule {}
