import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteActivityCommand } from './delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeleteActivityHandler implements ICommandHandler<DeleteActivityCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeleteActivityCommand): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
