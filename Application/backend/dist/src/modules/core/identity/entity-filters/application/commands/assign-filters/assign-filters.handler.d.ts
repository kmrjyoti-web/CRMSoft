import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { AssignFiltersCommand } from './assign-filters.command';
export declare class AssignFiltersHandler implements ICommandHandler<AssignFiltersCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: AssignFiltersCommand): Promise<{
        assigned: number;
        skipped: number;
    }>;
}
