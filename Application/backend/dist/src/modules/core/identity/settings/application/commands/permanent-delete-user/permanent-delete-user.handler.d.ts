import { ICommandHandler } from '@nestjs/cqrs';
import { PermanentDeleteUserCommand } from './permanent-delete-user.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class PermanentDeleteUserHandler implements ICommandHandler<PermanentDeleteUserCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: PermanentDeleteUserCommand): Promise<void>;
}
