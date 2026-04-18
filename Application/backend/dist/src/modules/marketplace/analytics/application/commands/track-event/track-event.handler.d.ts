import { ICommandHandler } from '@nestjs/cqrs';
import { TrackEventCommand } from './track-event.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class TrackEventHandler implements ICommandHandler<TrackEventCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: TrackEventCommand): Promise<void>;
    private updateEntityCounter;
}
