import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { DeactivateValueCommand } from './deactivate-value.command';
export declare class DeactivateValueHandler implements ICommandHandler<DeactivateValueCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeactivateValueCommand): Promise<void>;
}
