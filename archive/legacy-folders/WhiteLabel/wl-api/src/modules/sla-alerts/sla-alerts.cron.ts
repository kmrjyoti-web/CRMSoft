import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SlaAlertsService } from './sla-alerts.service';

@Injectable()
export class SlaAlertsCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SlaAlertsCron.name);
  private breachInterval: NodeJS.Timeout;
  private overdueInterval: NodeJS.Timeout;

  constructor(private slaAlertsService: SlaAlertsService) {}

  onModuleInit() {
    const ONE_HOUR = 60 * 60 * 1000;

    // Hourly: check for new breaches and 24h warnings
    this.breachInterval = setInterval(async () => {
      this.logger.log('Running SLA breach check...');
      try {
        await this.slaAlertsService.checkSlaBreaches();
        await this.slaAlertsService.checkUpcomingBreaches();
      } catch (err: unknown) {
        this.logger.error('SLA breach check failed', err instanceof Error ? err.stack : String(err));
      }
    }, ONE_HOUR);

    // Hourly: mark overdue invoices and send payment reminders
    this.overdueInterval = setInterval(async () => {
      this.logger.log('Running payment overdue check...');
      try {
        await this.slaAlertsService.checkPaymentOverdue();
      } catch (err: unknown) {
        this.logger.error('Payment overdue check failed', err instanceof Error ? err.stack : String(err));
      }
    }, ONE_HOUR);

    this.logger.log('SLA alerts cron started (hourly intervals)');
  }

  onModuleDestroy() {
    clearInterval(this.breachInterval);
    clearInterval(this.overdueInterval);
  }
}
