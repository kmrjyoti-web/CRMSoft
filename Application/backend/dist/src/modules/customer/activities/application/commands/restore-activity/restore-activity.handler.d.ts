import { ICommandHandler } from '@nestjs/cqrs';
import { RestoreActivityCommand } from './restore-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class RestoreActivityHandler implements ICommandHandler<RestoreActivityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: RestoreActivityCommand): Promise<void>;
}
