import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ResetLookupDefaultsCommand } from './reset-lookup-defaults.command';
export declare class ResetLookupDefaultsHandler implements ICommandHandler<ResetLookupDefaultsCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: ResetLookupDefaultsCommand): Promise<{
        restoredCount: number;
    }>;
}
