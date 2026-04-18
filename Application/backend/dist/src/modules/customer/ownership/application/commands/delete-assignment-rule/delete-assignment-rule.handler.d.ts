import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteAssignmentRuleCommand } from './delete-assignment-rule.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeleteAssignmentRuleHandler implements ICommandHandler<DeleteAssignmentRuleCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeleteAssignmentRuleCommand): Promise<{
        success: boolean;
    }>;
}
