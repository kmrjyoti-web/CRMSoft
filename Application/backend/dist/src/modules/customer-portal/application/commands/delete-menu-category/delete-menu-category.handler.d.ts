import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteMenuCategoryCommand } from './delete-menu-category.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class DeleteMenuCategoryHandler implements ICommandHandler<DeleteMenuCategoryCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeleteMenuCategoryCommand): Promise<{
        message: string;
    }>;
}
