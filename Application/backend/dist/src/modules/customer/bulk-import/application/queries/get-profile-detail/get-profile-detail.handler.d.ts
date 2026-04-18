import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetProfileDetailQuery } from './get-profile-detail.query';
export declare class GetProfileDetailHandler implements IQueryHandler<GetProfileDetailQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetProfileDetailQuery): Promise<{
        importJobs: {
            id: string;
            createdAt: Date;
            status: import("@prisma/working-client").$Enums.ImportJobStatus;
            fileName: string;
            totalRows: number;
            importedCount: number;
        }[];
    } & {
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
    }>;
}
