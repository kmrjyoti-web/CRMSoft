import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { UpdateValueCommand } from './update-value.command';
export declare class UpdateValueHandler implements ICommandHandler<UpdateValueCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateValueCommand): Promise<void>;
}
