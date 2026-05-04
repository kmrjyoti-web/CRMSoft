import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecurrenceController } from './presentation/recurrence.controller';
import { CreateRecurrenceHandler } from './application/commands/create-recurrence/create-recurrence.handler';
import { UpdateRecurrenceHandler } from './application/commands/update-recurrence/update-recurrence.handler';
import { CancelRecurrenceHandler } from './application/commands/cancel-recurrence/cancel-recurrence.handler';
import { GetRecurrenceListHandler } from './application/queries/get-recurrence-list/get-recurrence-list.handler';
import { GetRecurrenceByIdHandler } from './application/queries/get-recurrence-by-id/get-recurrence-by-id.handler';
import { RecurrenceGeneratorService } from './application/services/recurrence-generator.service';

const CommandHandlers = [CreateRecurrenceHandler, UpdateRecurrenceHandler, CancelRecurrenceHandler];
const QueryHandlers = [GetRecurrenceListHandler, GetRecurrenceByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [RecurrenceController],
  providers: [...CommandHandlers, ...QueryHandlers, RecurrenceGeneratorService],
})
export class RecurrenceModule {}
