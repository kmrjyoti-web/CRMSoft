import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { CreateLookupCommand } from './create-lookup.command';
export declare class CreateLookupHandler implements ICommandHandler<CreateLookupCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: CreateLookupCommand): Promise<string>;
}
