import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { DeactivateLookupCommand } from './deactivate-lookup.command';
export declare class DeactivateLookupHandler implements ICommandHandler<DeactivateLookupCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeactivateLookupCommand): Promise<void>;
}
