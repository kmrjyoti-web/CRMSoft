import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DbMaintenanceService } from './db-maintenance.service';
import { DbMaintenanceCron } from './db-maintenance.cron';
import { DbMaintenanceController } from './presentation/db-maintenance.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [DbMaintenanceController],
  providers: [DbMaintenanceService, DbMaintenanceCron],
  exports: [DbMaintenanceService],
})
export class DbMaintenanceModule {}
