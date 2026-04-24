import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { BackupCron } from './backup.cron';
import { BackupOpsController } from './presentation/backup-ops.controller';
import { R2StorageService } from '../../../shared/infrastructure/storage/r2-storage.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BackupOpsController],
  providers: [BackupService, BackupCron, R2StorageService],
  exports: [BackupService],
})
export class BackupOpsModule {}
