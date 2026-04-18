import { ICommandHandler } from '@nestjs/cqrs';
import { DeactivateActivityCommand } from './deactivate-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeactivateActivityHandler implements ICommandHandler<DeactivateActivityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeactivateActivityCommand): Promise<void>;
}
