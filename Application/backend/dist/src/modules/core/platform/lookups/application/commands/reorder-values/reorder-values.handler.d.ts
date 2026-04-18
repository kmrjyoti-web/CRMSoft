import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ReorderValuesCommand } from './reorder-values.command';
export declare class ReorderValuesHandler implements ICommandHandler<ReorderValuesCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: ReorderValuesCommand): Promise<void>;
}
