import { Module } from '@nestjs/common';
import { SlaAlertsService } from './sla-alerts.service';
import { SlaAlertsController } from './sla-alerts.controller';
import { SlaAlertsCron } from './sla-alerts.cron';

@Module({
  providers: [SlaAlertsService, SlaAlertsCron],
  controllers: [SlaAlertsController],
  exports: [SlaAlertsService],
})
export class SlaAlertsModule {}
