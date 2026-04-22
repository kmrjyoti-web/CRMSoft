import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TableConfigModule } from '../../softwarevendor/table-config/table-config.module';
import { WorkflowCoreModule } from '../../../core/workflow/workflow-core.module';
import { LeadsController } from './presentation/leads.controller';
import { LeadRepository } from './infrastructure/repositories/lead.repository';
import { LEAD_REPOSITORY } from './domain/interfaces/lead-repository.interface';

// Commands
import { CreateLeadHandler } from './application/commands/create-lead/create-lead.handler';
import { QuickCreateLeadHandler } from './application/commands/quick-create-lead/quick-create-lead.handler';
import { AllocateLeadHandler } from './application/commands/allocate-lead/allocate-lead.handler';
import { ChangeLeadStatusHandler } from './application/commands/change-lead-status/change-lead-status.handler';
import { UpdateLeadHandler } from './application/commands/update-lead/update-lead.handler';
import { DeactivateLeadHandler } from './application/commands/deactivate-lead/deactivate-lead.handler';
import { ReactivateLeadHandler } from './application/commands/reactivate-lead/reactivate-lead.handler';
import { SoftDeleteLeadHandler } from './application/commands/soft-delete-lead/soft-delete-lead.handler';
import { RestoreLeadHandler } from './application/commands/restore-lead/restore-lead.handler';
import { PermanentDeleteLeadHandler } from './application/commands/permanent-delete-lead/permanent-delete-lead.handler';

// Queries
import { GetLeadByIdHandler } from './application/queries/get-lead-by-id/get-lead-by-id.handler';
import { GetLeadsListHandler } from './application/queries/get-leads-list/get-leads-list.handler';

// Events
import { OnLeadCreatedHandler } from './application/event-handlers/on-lead-created.handler';
import { OnLeadAllocatedHandler } from './application/event-handlers/on-lead-allocated.handler';
import { OnLeadStatusChangedHandler } from './application/event-handlers/on-lead-status-changed.handler';

const CommandHandlers = [
  CreateLeadHandler, QuickCreateLeadHandler, AllocateLeadHandler,
  ChangeLeadStatusHandler, UpdateLeadHandler,
  DeactivateLeadHandler, ReactivateLeadHandler,
  SoftDeleteLeadHandler, RestoreLeadHandler, PermanentDeleteLeadHandler,
];
const QueryHandlers = [GetLeadByIdHandler, GetLeadsListHandler];
const EventHandlers = [OnLeadCreatedHandler, OnLeadAllocatedHandler, OnLeadStatusChangedHandler];

@Module({
  imports: [CqrsModule, TableConfigModule, WorkflowCoreModule],
  controllers: [LeadsController],
  providers: [
    { provide: LEAD_REPOSITORY, useClass: LeadRepository },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [LEAD_REPOSITORY],
})
export class LeadsModule {}
