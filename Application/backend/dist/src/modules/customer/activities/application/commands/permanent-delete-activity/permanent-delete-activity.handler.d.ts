import { ICommandHandler } from '@nestjs/cqrs';
import { PermanentDeleteActivityCommand } from './permanent-delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class PermanentDeleteActivityHandler implements ICommandHandler<PermanentDeleteActivityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: PermanentDeleteActivityCommand): Promise<void>;
}
