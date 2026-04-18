import { ICommandHandler } from '@nestjs/cqrs';
import { RestoreUserCommand } from './restore-user.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class RestoreUserHandler implements ICommandHandler<RestoreUserCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: RestoreUserCommand): Promise<void>;
}
