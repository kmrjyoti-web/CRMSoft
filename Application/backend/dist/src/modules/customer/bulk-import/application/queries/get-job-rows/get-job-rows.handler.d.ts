import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetJobRowsQuery } from './get-job-rows.query';
export declare class GetJobRowsHandler implements IQueryHandler<GetJobRowsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetJobRowsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            userAction: string | null;
            importJobId: string;
            rowNumber: number;
            rowData: import("@prisma/working-client/runtime/library").JsonValue;
            mappedData: import("@prisma/working-client/runtime/library").JsonValue | null;
            rowStatus: import("@prisma/working-client").$Enums.ImportRowStatus;
            validationErrors: import("@prisma/working-client/runtime/library").JsonValue | null;
            validationWarnings: import("@prisma/working-client/runtime/library").JsonValue | null;
            isDuplicate: boolean;
            duplicateType: string | null;
            duplicateOfEntityId: string | null;
            duplicateOfRowNumber: number | null;
            duplicateMatchField: string | null;
            duplicateMatchValue: string | null;
            fuzzyMatchScore: import("@prisma/working-client/runtime/library").Decimal | null;
            fuzzyMatchDetails: import("@prisma/working-client/runtime/library").JsonValue | null;
            patchPreview: import("@prisma/working-client/runtime/library").JsonValue | null;
            userEditedData: import("@prisma/working-client/runtime/library").JsonValue | null;
            importedEntityId: string | null;
            importAction: string | null;
            importError: string | null;
            importedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
