import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ScalingService } from './scaling.service';

@Injectable()
export class ScalingCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScalingCron.name);
  private evaluationInterval: NodeJS.Timeout;

  constructor(private scalingService: ScalingService) {}

  onModuleInit() {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;

    this.evaluationInterval = setInterval(async () => {
      this.logger.log('Running auto-scaling evaluation...');
      try {
        await this.scalingService.evaluateAll();
      } catch (err: unknown) {
        this.logger.error('Auto-scaling evaluation failed', err instanceof Error ? err.stack : String(err));
      }
    }, FIFTEEN_MINUTES);

    this.logger.log('Scaling cron started (15-minute intervals)');
  }

  onModuleDestroy() {
    clearInterval(this.evaluationInterval);
  }
}
