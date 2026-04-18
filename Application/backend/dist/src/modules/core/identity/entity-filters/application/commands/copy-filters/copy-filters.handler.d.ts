import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { CopyFiltersCommand } from './copy-filters.command';
export declare class CopyFiltersHandler implements ICommandHandler<CopyFiltersCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: CopyFiltersCommand): Promise<number>;
}
