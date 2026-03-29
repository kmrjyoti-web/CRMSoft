import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ProcessTrackingEventCommand } from './process-tracking-event.command';
import { TrackingService } from '../../../services/tracking.service';

@CommandHandler(ProcessTrackingEventCommand)
export class ProcessTrackingEventHandler implements ICommandHandler<ProcessTrackingEventCommand> {
  private readonly logger = new Logger(ProcessTrackingEventHandler.name);

  constructor(private readonly trackingService: TrackingService) {}

  async execute(cmd: ProcessTrackingEventCommand) {
    switch (cmd.eventType) {
      case 'OPEN':
        if (cmd.trackingPixelId) {
          await this.trackingService.recordOpen(cmd.trackingPixelId, cmd.ipAddress, cmd.userAgent);
          this.logger.log(`Tracking event: OPEN for pixel ${cmd.trackingPixelId}`);
        }
        break;

      case 'CLICK':
        if (cmd.emailId && cmd.clickedUrl) {
          const originalUrl = await this.trackingService.recordClick(
            cmd.emailId,
            cmd.clickedUrl,
            cmd.ipAddress,
            cmd.userAgent,
          );
          this.logger.log(`Tracking event: CLICK for email ${cmd.emailId} -> ${cmd.clickedUrl}`);
          return originalUrl;
        }
        break;

      case 'BOUNCE':
        if (cmd.emailId && cmd.bounceReason) {
          await this.trackingService.recordBounce(cmd.emailId, cmd.bounceReason);
          this.logger.log(`Tracking event: BOUNCE for email ${cmd.emailId}`);
        }
        break;
    }
    return undefined;
  }
}
