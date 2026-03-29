import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RequirementsController } from './presentation/requirements.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { PostRequirementHandler } from './application/commands/post-requirement/post-requirement.handler';
import { SubmitQuoteHandler } from './application/commands/submit-quote/submit-quote.handler';
import { AcceptQuoteHandler } from './application/commands/accept-quote/accept-quote.handler';
import { RejectQuoteHandler } from './application/commands/reject-quote/reject-quote.handler';
import { ListRequirementsHandler } from './application/queries/list-requirements/list-requirements.handler';
import { GetRequirementQuotesHandler } from './application/queries/get-requirement-quotes/get-requirement-quotes.handler';

const CommandHandlers = [
  PostRequirementHandler,
  SubmitQuoteHandler,
  AcceptQuoteHandler,
  RejectQuoteHandler,
];

const QueryHandlers = [
  ListRequirementsHandler,
  GetRequirementQuotesHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [RequirementsController],
  providers: [MktPrismaService, ...CommandHandlers, ...QueryHandlers],
})
export class RequirementsModule {}
