import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { RemoveFilterCommand } from './remove-filter.command';
export declare class RemoveFilterHandler implements ICommandHandler<RemoveFilterCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: RemoveFilterCommand): Promise<void>;
}
