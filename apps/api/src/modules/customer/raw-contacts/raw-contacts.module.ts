import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TableConfigModule } from '../../softwarevendor/table-config/table-config.module';
import { AccountsModule } from '../../customer/accounts/accounts.module';
import { ControlRoomModule } from '../../softwarevendor/control-room/control-room.module';
import { RawContactsController } from './presentation/raw-contacts.controller';
import { RawContactRepository } from './infrastructure/repositories/raw-contact.repository';
import { RAW_CONTACT_REPOSITORY } from './domain/interfaces/raw-contact-repository.interface';

// Commands
import { CreateRawContactHandler } from './application/commands/create-raw-contact/create-raw-contact.handler';
import { VerifyRawContactHandler } from './application/commands/verify-raw-contact/verify-raw-contact.handler';
import { RejectRawContactHandler } from './application/commands/reject-raw-contact/reject-raw-contact.handler';
import { MarkDuplicateHandler } from './application/commands/mark-duplicate/mark-duplicate.handler';
import { ReopenRawContactHandler } from './application/commands/reopen-raw-contact/reopen-raw-contact.handler';
import { UpdateRawContactHandler } from './application/commands/update-raw-contact/update-raw-contact.handler';
import { DeactivateRawContactHandler } from './application/commands/deactivate-raw-contact/deactivate-raw-contact.handler';
import { ReactivateRawContactHandler } from './application/commands/reactivate-raw-contact/reactivate-raw-contact.handler';
import { SoftDeleteRawContactHandler } from './application/commands/soft-delete-raw-contact/soft-delete-raw-contact.handler';
import { RestoreRawContactHandler } from './application/commands/restore-raw-contact/restore-raw-contact.handler';
import { PermanentDeleteRawContactHandler } from './application/commands/permanent-delete-raw-contact/permanent-delete-raw-contact.handler';

// Queries
import { GetRawContactByIdHandler } from './application/queries/get-raw-contact-by-id/get-raw-contact-by-id.handler';
import { GetRawContactsListHandler } from './application/queries/get-raw-contacts-list/get-raw-contacts-list.handler';

// Events
import { OnRawContactCreatedHandler } from './application/event-handlers/on-raw-contact-created.handler';
import { OnRawContactVerifiedHandler } from './application/event-handlers/on-raw-contact-verified.handler';

const CommandHandlers = [
  CreateRawContactHandler, VerifyRawContactHandler, RejectRawContactHandler,
  MarkDuplicateHandler, ReopenRawContactHandler, UpdateRawContactHandler,
  DeactivateRawContactHandler, ReactivateRawContactHandler,
  SoftDeleteRawContactHandler, RestoreRawContactHandler, PermanentDeleteRawContactHandler,
];
const QueryHandlers = [GetRawContactByIdHandler, GetRawContactsListHandler];
const EventHandlers = [OnRawContactCreatedHandler, OnRawContactVerifiedHandler];

@Module({
  imports: [CqrsModule, TableConfigModule, AccountsModule, ControlRoomModule],
  controllers: [RawContactsController],
  providers: [
    { provide: RAW_CONTACT_REPOSITORY, useClass: RawContactRepository },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [RAW_CONTACT_REPOSITORY],
})
export class RawContactsModule {}
