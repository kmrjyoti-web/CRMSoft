import { ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteUserCommand } from './soft-delete-user.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class SoftDeleteUserHandler implements ICommandHandler<SoftDeleteUserCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: SoftDeleteUserCommand): Promise<void>;
}
