import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ReplaceFiltersCommand } from './replace-filters.command';
export declare class ReplaceFiltersHandler implements ICommandHandler<ReplaceFiltersCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: ReplaceFiltersCommand): Promise<{
        removed: number;
        assigned: number;
    }>;
}
