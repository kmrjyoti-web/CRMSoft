import { IQueryHandler } from '@nestjs/cqrs';
import { GetFolderContentsQuery } from './get-folder-contents.query';
import { FolderService } from '../../../services/folder.service';
export declare class GetFolderContentsHandler implements IQueryHandler<GetFolderContentsQuery> {
    private readonly folderService;
    private readonly logger;
    constructor(folderService: FolderService);
    execute(query: GetFolderContentsQuery): Promise<{
        folder: {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            isActive: boolean;
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
            sortOrder: number;
            parentId: string | null;
        };
        subFolders: ({
            _count: {
                children: number;
                documents: number;
            };
        } & {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            isActive: boolean;
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
            sortOrder: number;
            parentId: string | null;
        })[];
        documents: {
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
        };
    }>;
}
