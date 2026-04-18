import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListRolesQuery } from './list-roles.query';
export declare class ListRolesHandler implements IQueryHandler<ListRolesQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListRolesQuery): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        displayName: string;
        isSystem: boolean;
        parentRoleName: string | null;
        level: number;
        canManageLevels: number[];
    })[]>;
}
