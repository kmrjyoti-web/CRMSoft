import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommunicationsController } from './presentation/communications.controller';
import { CommunicationRepository } from './infrastructure/repositories/communication.repository';
import { COMMUNICATION_REPOSITORY } from './domain/interfaces/communication-repository.interface';

// Commands
import { AddCommunicationHandler } from './application/commands/add-communication/add-communication.handler';
import { UpdateCommunicationHandler } from './application/commands/update-communication/update-communication.handler';
import { DeleteCommunicationHandler } from './application/commands/delete-communication/delete-communication.handler';
import { SetPrimaryHandler } from './application/commands/set-primary/set-primary.handler';
import { MarkVerifiedHandler } from './application/commands/mark-verified/mark-verified.handler';
import { LinkToEntityHandler } from './application/commands/link-to-entity/link-to-entity.handler';

// Queries
import { GetCommunicationByIdHandler } from './application/queries/get-communication-by-id/get-communication-by-id.handler';
import { GetCommunicationsByEntityHandler } from './application/queries/get-communications-by-entity/get-communications-by-entity.handler';

const CommandHandlers = [
  AddCommunicationHandler, UpdateCommunicationHandler, DeleteCommunicationHandler,
  SetPrimaryHandler, MarkVerifiedHandler, LinkToEntityHandler,
];
const QueryHandlers = [GetCommunicationByIdHandler, GetCommunicationsByEntityHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CommunicationsController],
  providers: [
    { provide: COMMUNICATION_REPOSITORY, useClass: CommunicationRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [COMMUNICATION_REPOSITORY],
})
export class CommunicationsModule {}
