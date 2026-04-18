import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetLookupByIdQuery } from './get-lookup-by-id.query';
export declare class GetLookupByIdHandler implements IQueryHandler<GetLookupByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetLookupByIdQuery): Promise<{
        values: ({
            children: {
                id: string;
                tenantId: string;
                isDefault: boolean;
                isActive: boolean;
                configJson: import("@prisma/platform-client/runtime/library").JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedById: string | null;
                updatedById: string | null;
                updatedByName: string | null;
                color: string | null;
                icon: string | null;
                value: string;
                label: string;
                parentId: string | null;
                lookupId: string;
                rowIndex: number;
            }[];
        } & {
            id: string;
            tenantId: string;
            isDefault: boolean;
            isActive: boolean;
            configJson: import("@prisma/platform-client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            color: string | null;
            icon: string | null;
            value: string;
            label: string;
            parentId: string | null;
            lookupId: string;
            rowIndex: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        displayName: string;
        isSystem: boolean;
    }>;
}
