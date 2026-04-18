import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetJobListQuery } from './get-job-list.query';
export declare class GetJobListHandler implements IQueryHandler<GetJobListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetJobListQuery): Promise<{
        data: ({
            profile: {
                id: string;
                name: string;
                sourceSystem: string | null;
            } | null;
        } & {
            id: string;
            tenantId: string;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/working-client").$Enums.ImportJobStatus;
            errorMessage: string | null;
            completedAt: Date | null;
            startedAt: Date | null;
            fileUrl: string | null;
            fileSize: number;
            targetEntity: import("@prisma/working-client").$Enums.ImportTargetEntity;
            profileId: string | null;
            fieldMapping: import("@prisma/working-client/runtime/library").JsonValue | null;
            validationRules: import("@prisma/working-client/runtime/library").JsonValue | null;
            duplicateCheckFields: string[];
            duplicateStrategy: import("@prisma/working-client").$Enums.DuplicateStrategy;
            fuzzyMatchEnabled: boolean;
            fuzzyMatchFields: string[];
            fuzzyThreshold: import("@prisma/working-client/runtime/library").Decimal;
            defaultValues: import("@prisma/working-client/runtime/library").JsonValue | null;
            fileName: string;
            fileType: string;
            profileMatchScore: import("@prisma/working-client/runtime/library").Decimal | null;
            usedAutoMapping: boolean;
            fileHeaders: string[];
            totalRows: number;
            sampleData: import("@prisma/working-client/runtime/library").JsonValue | null;
            validRows: number;
            invalidRows: number;
            duplicateExactRows: number;
            duplicateFuzzyRows: number;
            duplicateInFileRows: number;
            skippedRows: number;
            importedCount: number;
            updatedCount: number;
            failedCount: number;
            resultReportUrl: string | null;
            failedRowsReportUrl: string | null;
            createdByName: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
