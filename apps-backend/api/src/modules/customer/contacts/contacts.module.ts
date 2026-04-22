import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TableConfigModule } from '../../softwarevendor/table-config/table-config.module';
import { ContactsController } from './presentation/contacts.controller';
import { ContactRepository } from './infrastructure/repositories/contact.repository';
import { CONTACT_REPOSITORY } from './domain/interfaces/contact-repository.interface';

// Commands
import { CreateContactHandler } from './application/commands/create-contact/create-contact.handler';
import { UpdateContactHandler } from './application/commands/update-contact/update-contact.handler';
import { DeactivateContactHandler } from './application/commands/deactivate-contact/deactivate-contact.handler';
import { ReactivateContactHandler } from './application/commands/reactivate-contact/reactivate-contact.handler';
import { SoftDeleteContactHandler } from './application/commands/soft-delete-contact/soft-delete-contact.handler';
import { RestoreContactHandler } from './application/commands/restore-contact/restore-contact.handler';
import { PermanentDeleteContactHandler } from './application/commands/permanent-delete-contact/permanent-delete-contact.handler';

// Queries
import { GetContactByIdHandler } from './application/queries/get-contact-by-id/get-contact-by-id.handler';
import { GetContactsListHandler } from './application/queries/get-contacts-list/get-contacts-list.handler';
import { GetContactsDashboardHandler } from './application/queries/get-contacts-dashboard/get-contacts-dashboard.handler';

// Events
import { OnContactCreatedHandler } from './application/event-handlers/on-contact-created.handler';
import { OnContactDeactivatedHandler } from './application/event-handlers/on-contact-deactivated.handler';

const CommandHandlers = [
  CreateContactHandler, UpdateContactHandler,
  DeactivateContactHandler, ReactivateContactHandler,
  SoftDeleteContactHandler, RestoreContactHandler, PermanentDeleteContactHandler,
];
const QueryHandlers = [GetContactByIdHandler, GetContactsListHandler, GetContactsDashboardHandler];
const EventHandlers = [OnContactCreatedHandler, OnContactDeactivatedHandler];

@Module({
  imports: [CqrsModule, TableConfigModule],
  controllers: [ContactsController],
  providers: [
    { provide: CONTACT_REPOSITORY, useClass: ContactRepository },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [CONTACT_REPOSITORY],
})
export class ContactsModule {}
