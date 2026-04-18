import { ICommandHandler } from '@nestjs/cqrs';
import { BulkAssignTaskCommand } from './bulk-assign-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class BulkAssignTaskHandler implements ICommandHandler<BulkAssignTaskCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: BulkAssignTaskCommand): Promise<{
        updated: number;
    }>;
}
