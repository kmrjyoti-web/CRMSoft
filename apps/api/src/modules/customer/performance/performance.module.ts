import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PerformanceController } from './presentation/performance.controller';
import { CreateTargetHandler } from './application/commands/create-target/create-target.handler';
import { UpdateTargetHandler } from './application/commands/update-target/update-target.handler';
import { DeleteTargetHandler } from './application/commands/delete-target/delete-target.handler';
import { ListTargetsHandler } from './application/queries/list-targets/list-targets.handler';
import { GetTargetHandler } from './application/queries/get-target/get-target.handler';
import { GetLeaderboardHandler } from './application/queries/get-leaderboard/get-leaderboard.handler';
import { GetTeamPerformanceHandler } from './application/queries/get-team-performance/get-team-performance.handler';

const CommandHandlers = [CreateTargetHandler, UpdateTargetHandler, DeleteTargetHandler];
const QueryHandlers = [ListTargetsHandler, GetTargetHandler, GetLeaderboardHandler, GetTeamPerformanceHandler];

@Module({
  imports: [CqrsModule],
  controllers: [PerformanceController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class PerformanceModule {}
