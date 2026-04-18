import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { DeleteFieldDefinitionCommand } from './delete-field-definition.command';
export declare class DeleteFieldDefinitionHandler implements ICommandHandler<DeleteFieldDefinitionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeleteFieldDefinitionCommand): Promise<{
        deactivated: boolean;
    }>;
}
