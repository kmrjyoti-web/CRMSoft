import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ValidateWorkflowCommand } from './validate-workflow.command';
export declare class ValidateWorkflowHandler implements ICommandHandler<ValidateWorkflowCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: ValidateWorkflowCommand): Promise<{
        valid: boolean;
        errors: string[];
        stateCount: number;
        transitionCount: number;
    }>;
}
