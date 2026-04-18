import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteTemplateCommand } from './delete-template.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeleteTemplateHandler implements ICommandHandler<DeleteTemplateCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeleteTemplateCommand): Promise<void>;
}
