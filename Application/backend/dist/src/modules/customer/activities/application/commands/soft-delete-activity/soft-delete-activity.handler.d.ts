import { ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteActivityCommand } from './soft-delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class SoftDeleteActivityHandler implements ICommandHandler<SoftDeleteActivityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: SoftDeleteActivityCommand): Promise<void>;
}
