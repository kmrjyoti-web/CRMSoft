import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DocumentCategory, StorageType } from '@prisma/working-client';
export declare class DocumentSearchService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(params: {
        query: string;
        category?: DocumentCategory;
        storageType?: StorageType;
        tags?: string[];
        uploadedById?: string;
        dateFrom?: Date;
        dateTo?: Date;
        mimeType?: string;
        minSize?: number;
        maxSize?: number;
        page?: number;
        limit?: number;
    }): Promise<{
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
