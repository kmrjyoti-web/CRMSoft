import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Services
import { OwnershipCoreService } from './services/ownership-core.service';
import { RoundRobinService } from './services/round-robin.service';
import { RuleEngineService } from './services/rule-engine.service';
import { WorkloadService } from './services/workload.service';
import { DelegationService } from './services/delegation.service';
import { OwnershipCronService } from './services/ownership-cron.service';

// Command Handlers
import { AssignOwnerHandler } from './application/commands/assign-owner/assign-owner.handler';
import { TransferOwnerHandler } from './application/commands/transfer-owner/transfer-owner.handler';
import { RevokeOwnerHandler } from './application/commands/revoke-owner/revoke-owner.handler';
import { DelegateOwnershipHandler } from './application/commands/delegate-ownership/delegate-ownership.handler';
import { RevertDelegationHandler } from './application/commands/revert-delegation/revert-delegation.handler';
import { BulkAssignHandler } from './application/commands/bulk-assign/bulk-assign.handler';
import { BulkTransferHandler } from './application/commands/bulk-transfer/bulk-transfer.handler';
import { AutoAssignHandler } from './application/commands/auto-assign/auto-assign.handler';
import { CreateAssignmentRuleHandler } from './application/commands/create-assignment-rule/create-assignment-rule.handler';
import { UpdateAssignmentRuleHandler } from './application/commands/update-assignment-rule/update-assignment-rule.handler';
import { DeleteAssignmentRuleHandler } from './application/commands/delete-assignment-rule/delete-assignment-rule.handler';
import { UpdateUserCapacityHandler } from './application/commands/update-user-capacity/update-user-capacity.handler';
import { SetUserAvailabilityHandler } from './application/commands/set-user-availability/set-user-availability.handler';

// Query Handlers
import { GetEntityOwnersHandler } from './application/queries/get-entity-owners/get-entity-owners.handler';
import { GetUserEntitiesHandler } from './application/queries/get-user-entities/get-user-entities.handler';
import { GetOwnershipHistoryHandler } from './application/queries/get-ownership-history/get-ownership-history.handler';
import { GetWorkloadDashboardHandler } from './application/queries/get-workload-dashboard/get-workload-dashboard.handler';
import { GetUserWorkloadHandler } from './application/queries/get-user-workload/get-user-workload.handler';
import { GetAssignmentRulesHandler } from './application/queries/get-assignment-rules/get-assignment-rules.handler';
import { GetUnassignedEntitiesHandler } from './application/queries/get-unassigned-entities/get-unassigned-entities.handler';
import { GetReassignmentPreviewHandler } from './application/queries/get-reassignment-preview/get-reassignment-preview.handler';
import { GetDelegationStatusHandler } from './application/queries/get-delegation-status/get-delegation-status.handler';

// Controllers
import { OwnershipController } from './presentation/ownership.controller';
import { OwnershipRulesController } from './presentation/ownership-rules.controller';
import { OwnershipWorkloadController } from './presentation/ownership-workload.controller';

const CommandHandlers = [
  AssignOwnerHandler, TransferOwnerHandler, RevokeOwnerHandler,
  DelegateOwnershipHandler, RevertDelegationHandler,
  BulkAssignHandler, BulkTransferHandler, AutoAssignHandler,
  CreateAssignmentRuleHandler, UpdateAssignmentRuleHandler, DeleteAssignmentRuleHandler,
  UpdateUserCapacityHandler, SetUserAvailabilityHandler,
];

const QueryHandlers = [
  GetEntityOwnersHandler, GetUserEntitiesHandler, GetOwnershipHistoryHandler,
  GetWorkloadDashboardHandler, GetUserWorkloadHandler, GetAssignmentRulesHandler,
  GetUnassignedEntitiesHandler, GetReassignmentPreviewHandler, GetDelegationStatusHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [OwnershipController, OwnershipRulesController, OwnershipWorkloadController],
  providers: [
    OwnershipCoreService, RoundRobinService, RuleEngineService,
    WorkloadService, DelegationService, OwnershipCronService,
    ...CommandHandlers, ...QueryHandlers,
  ],
  exports: [OwnershipCoreService, RuleEngineService, WorkloadService],
})
export class OwnershipModule {}
