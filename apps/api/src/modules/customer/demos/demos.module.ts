import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DemoController } from './presentation/demo.controller';
import { CreateDemoHandler } from './application/commands/create-demo/create-demo.handler';
import { UpdateDemoHandler } from './application/commands/update-demo/update-demo.handler';
import { RescheduleDemoHandler } from './application/commands/reschedule-demo/reschedule-demo.handler';
import { CompleteDemoHandler } from './application/commands/complete-demo/complete-demo.handler';
import { CancelDemoHandler } from './application/commands/cancel-demo/cancel-demo.handler';
import { GetDemoListHandler } from './application/queries/get-demo-list/get-demo-list.handler';
import { GetDemoByIdHandler } from './application/queries/get-demo-by-id/get-demo-by-id.handler';
import { GetDemosByLeadHandler } from './application/queries/get-demos-by-lead/get-demos-by-lead.handler';
import { GetDemoStatsHandler } from './application/queries/get-demo-stats/get-demo-stats.handler';

const CommandHandlers = [CreateDemoHandler, UpdateDemoHandler, RescheduleDemoHandler, CompleteDemoHandler, CancelDemoHandler];
const QueryHandlers = [GetDemoListHandler, GetDemoByIdHandler, GetDemosByLeadHandler, GetDemoStatsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [DemoController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class DemosModule {}
