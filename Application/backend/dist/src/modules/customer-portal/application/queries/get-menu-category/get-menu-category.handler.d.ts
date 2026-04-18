import { IQueryHandler } from '@nestjs/cqrs';
import { GetMenuCategoryQuery } from './get-menu-category.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class GetMenuCategoryHandler implements IQueryHandler<GetMenuCategoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetMenuCategoryQuery): Promise<{
        _count: {
            users: number;
        };
    } & {
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
