import { ICommandHandler } from '@nestjs/cqrs';
import { CreateMenuCategoryCommand } from './create-menu-category.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class CreateMenuCategoryHandler implements ICommandHandler<CreateMenuCategoryCommand> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(command: CreateMenuCategoryCommand): Promise<{
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
