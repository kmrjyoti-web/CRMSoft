import { Module } from '@nestjs/common';
import { TaskLogicController } from './presentation/task-logic.controller';
import { TaskLogicService } from './task-logic.service';

@Module({
  controllers: [TaskLogicController],
  providers: [TaskLogicService],
  exports: [TaskLogicService],
})
export class TaskLogicModule {}
