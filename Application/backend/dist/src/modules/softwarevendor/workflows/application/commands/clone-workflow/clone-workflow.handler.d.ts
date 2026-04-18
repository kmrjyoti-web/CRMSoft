import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CloneWorkflowCommand } from './clone-workflow.command';
export declare class CloneWorkflowHandler implements ICommandHandler<CloneWorkflowCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CloneWorkflowCommand): Promise<any>;
}
