import { IQueryHandler } from '@nestjs/cqrs';
import { ListMenuCategoriesQuery } from './list-menu-categories.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class ListMenuCategoriesHandler implements IQueryHandler<ListMenuCategoriesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListMenuCategoriesQuery): Promise<({
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
    })[]>;
}
