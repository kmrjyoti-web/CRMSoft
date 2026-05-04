import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ContactOrganizationsController } from './presentation/contact-organizations.controller';
import { ContactOrgRepository } from './infrastructure/repositories/contact-org.repository';
import { CONTACT_ORG_REPOSITORY } from './domain/interfaces/contact-org-repository.interface';

// Commands
import { LinkContactToOrgHandler } from './application/commands/link-contact-to-org/link-contact-to-org.handler';
import { UnlinkContactFromOrgHandler } from './application/commands/unlink-contact-from-org/unlink-contact-from-org.handler';
import { SetPrimaryContactHandler } from './application/commands/set-primary-contact/set-primary-contact.handler';
import { ChangeRelationTypeHandler } from './application/commands/change-relation-type/change-relation-type.handler';
import { UpdateMappingHandler } from './application/commands/update-mapping/update-mapping.handler';

// Queries
import { GetContactOrgByIdHandler } from './application/queries/get-by-id/get-by-id.handler';
import { GetOrgsByContactHandler } from './application/queries/get-by-contact/get-by-contact.handler';
import { GetContactsByOrgHandler } from './application/queries/get-by-organization/get-by-organization.handler';

const CommandHandlers = [
  LinkContactToOrgHandler, UnlinkContactFromOrgHandler,
  SetPrimaryContactHandler, ChangeRelationTypeHandler, UpdateMappingHandler,
];
const QueryHandlers = [
  GetContactOrgByIdHandler, GetOrgsByContactHandler, GetContactsByOrgHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ContactOrganizationsController],
  providers: [
    { provide: CONTACT_ORG_REPOSITORY, useClass: ContactOrgRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [CONTACT_ORG_REPOSITORY],
})
export class ContactOrganizationsModule {}
