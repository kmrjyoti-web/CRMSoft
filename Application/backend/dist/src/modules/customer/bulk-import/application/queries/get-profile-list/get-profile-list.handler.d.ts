import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetProfileListQuery } from './get-profile-list.query';
export declare class GetProfileListHandler implements IQueryHandler<GetProfileListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetProfileListQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            isDefault: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            color: string | null;
            icon: string | null;
            status: import("@prisma/working-client").$Enums.ProfileStatus;
            usageCount: number;
            lastUsedAt: Date | null;
            targetEntity: import("@prisma/working-client").$Enums.ImportTargetEntity;
            sourceSystem: string | null;
            fieldMapping: import("@prisma/working-client/runtime/library").JsonValue;
            validationRules: import("@prisma/working-client/runtime/library").JsonValue | null;
            duplicateCheckFields: string[];
            duplicateStrategy: import("@prisma/working-client").$Enums.DuplicateStrategy;
            fuzzyMatchEnabled: boolean;
            fuzzyMatchFields: string[];
            fuzzyThreshold: import("@prisma/working-client/runtime/library").Decimal;
            defaultValues: import("@prisma/working-client/runtime/library").JsonValue | null;
            createdByName: string;
            expectedHeaders: string[];
            headerMatchMode: string;
            totalImported: number;
            avgSuccessRate: import("@prisma/working-client/runtime/library").Decimal | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
