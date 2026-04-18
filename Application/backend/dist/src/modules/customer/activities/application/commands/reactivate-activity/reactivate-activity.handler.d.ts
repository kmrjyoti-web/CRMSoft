import { ICommandHandler } from '@nestjs/cqrs';
import { ReactivateActivityCommand } from './reactivate-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class ReactivateActivityHandler implements ICommandHandler<ReactivateActivityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: ReactivateActivityCommand): Promise<void>;
}
