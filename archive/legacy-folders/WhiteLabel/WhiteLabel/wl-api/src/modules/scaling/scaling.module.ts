import { Module } from '@nestjs/common';
import { ScalingService } from './scaling.service';
import { ScalingController } from './scaling.controller';
import { ScalingCron } from './scaling.cron';

@Module({
  providers: [ScalingService, ScalingCron],
  controllers: [ScalingController],
  exports: [ScalingService],
})
export class ScalingModule {}
