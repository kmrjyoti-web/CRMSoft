import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RowBulkActionCommand } from './row-bulk-action.command';
export declare class RowBulkActionHandler implements ICommandHandler<RowBulkActionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RowBulkActionCommand): Promise<{
        updated: number;
        action: string;
    }>;
}
