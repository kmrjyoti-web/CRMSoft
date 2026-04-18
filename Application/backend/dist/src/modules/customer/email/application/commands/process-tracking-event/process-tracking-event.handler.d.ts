import { ICommandHandler } from '@nestjs/cqrs';
import { ProcessTrackingEventCommand } from './process-tracking-event.command';
import { TrackingService } from '../../../services/tracking.service';
export declare class ProcessTrackingEventHandler implements ICommandHandler<ProcessTrackingEventCommand> {
    private readonly trackingService;
    private readonly logger;
    constructor(trackingService: TrackingService);
    execute(cmd: ProcessTrackingEventCommand): Promise<string | undefined>;
}
