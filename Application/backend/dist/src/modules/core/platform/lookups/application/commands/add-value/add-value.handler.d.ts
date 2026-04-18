import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { AddValueCommand } from './add-value.command';
export declare class AddValueHandler implements ICommandHandler<AddValueCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: AddValueCommand): Promise<string>;
}
