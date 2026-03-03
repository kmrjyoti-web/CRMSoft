import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizationsController } from './presentation/organizations.controller';
import { OrganizationRepository } from './infrastructure/repositories/organization.repository';
import { ORGANIZATION_REPOSITORY } from './domain/interfaces/organization-repository.interface';

// Commands
import { CreateOrganizationHandler } from './application/commands/create-organization/create-organization.handler';
import { UpdateOrganizationHandler } from './application/commands/update-organization/update-organization.handler';
import { DeactivateOrganizationHandler } from './application/commands/deactivate-organization/deactivate-organization.handler';
import { ReactivateOrganizationHandler } from './application/commands/reactivate-organization/reactivate-organization.handler';
import { SoftDeleteOrganizationHandler } from './application/commands/soft-delete-organization/soft-delete-organization.handler';
import { RestoreOrganizationHandler } from './application/commands/restore-organization/restore-organization.handler';
import { PermanentDeleteOrganizationHandler } from './application/commands/permanent-delete-organization/permanent-delete-organization.handler';

// Queries
import { GetOrganizationByIdHandler } from './application/queries/get-organization-by-id/get-organization-by-id.handler';
import { GetOrganizationsListHandler } from './application/queries/get-organizations-list/get-organizations-list.handler';

// Events
import { OnOrganizationCreatedHandler } from './application/event-handlers/on-organization-created.handler';
import { OnOrganizationDeactivatedHandler } from './application/event-handlers/on-organization-deactivated.handler';

const CommandHandlers = [
  CreateOrganizationHandler, UpdateOrganizationHandler,
  DeactivateOrganizationHandler, ReactivateOrganizationHandler,
  SoftDeleteOrganizationHandler, RestoreOrganizationHandler, PermanentDeleteOrganizationHandler,
];
const QueryHandlers = [GetOrganizationByIdHandler, GetOrganizationsListHandler];
const EventHandlers = [OnOrganizationCreatedHandler, OnOrganizationDeactivatedHandler];

@Module({
  imports: [CqrsModule],
  controllers: [OrganizationsController],
  providers: [
    { provide: ORGANIZATION_REPOSITORY, useClass: OrganizationRepository },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [ORGANIZATION_REPOSITORY],
})
export class OrganizationsModule {}
