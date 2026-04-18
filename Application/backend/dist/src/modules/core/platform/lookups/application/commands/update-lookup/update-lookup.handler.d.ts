import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { UpdateLookupCommand } from './update-lookup.command';
export declare class UpdateLookupHandler implements ICommandHandler<UpdateLookupCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateLookupCommand): Promise<void>;
}
