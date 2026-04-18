import { IQueryHandler } from '@nestjs/cqrs';
import { SearchDocumentsQuery } from './search-documents.query';
import { DocumentSearchService } from '../../../services/search.service';
export declare class SearchDocumentsHandler implements IQueryHandler<SearchDocumentsQuery> {
    private readonly searchService;
    private readonly logger;
    constructor(searchService: DocumentSearchService);
    execute(query: SearchDocumentsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            description: string | null;
            version: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            category: import("@prisma/working-client").$Enums.DocumentCategory;
            status: import("@prisma/working-client").$Enums.DocumentStatus;
            tags: string[];
            thumbnailUrl: string | null;
            fileSize: number;
            fileName: string;
            originalName: string;
            mimeType: string;
            storagePath: string | null;
            storageType: import("@prisma/working-client").$Enums.StorageType;
            storageProvider: import("@prisma/working-client").$Enums.StorageProvider;
            storageUrl: string | null;
            cloudFileId: string | null;
            uploadedById: string;
            parentVersionId: string | null;
            folderId: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
