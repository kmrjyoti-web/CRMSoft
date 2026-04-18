import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateMenuCategoryCommand } from './update-menu-category.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class UpdateMenuCategoryHandler implements ICommandHandler<UpdateMenuCategoryCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateMenuCategoryCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isDefault: boolean;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        color: string | null;
        icon: string | null;
        sortOrder: number;
        nameHi: string | null;
        enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
    }>;
}
