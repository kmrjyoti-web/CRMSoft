import { IQueryHandler } from '@nestjs/cqrs';
import { GetDocumentStatsQuery } from './get-document-stats.query';
import { DocumentService } from '../../../services/document.service';
export declare class GetDocumentStatsHandler implements IQueryHandler<GetDocumentStatsQuery> {
    private readonly documentService;
    private readonly logger;
    constructor(documentService: DocumentService);
    execute(query: GetDocumentStatsQuery): Promise<{
        totalDocuments: number;
        totalSizeBytes: number;
        totalSizeMB: number;
        byCategory: {
            category: import("@prisma/working-client").$Enums.DocumentCategory;
            count: number;
        }[];
        byStorageType: {
            storageType: import("@prisma/working-client").$Enums.StorageType;
            count: number;
        }[];
    }>;
}
