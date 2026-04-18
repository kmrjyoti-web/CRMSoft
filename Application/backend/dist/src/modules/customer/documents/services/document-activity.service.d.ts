import { PrismaService } from '../../../../core/prisma/prisma.service';
export type DocumentActionType = 'UPLOADED' | 'VIEWED' | 'DOWNLOADED' | 'UPDATED' | 'DELETED' | 'RESTORED' | 'MOVED' | 'ATTACHED' | 'DETACHED' | 'VERSION_CREATED' | 'SHARED' | 'SHARE_REVOKED' | 'SHARE_ACCESSED';
export declare class DocumentActivityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(data: {
        documentId: string;
        action: DocumentActionType;
        userId: string;
        details?: Record<string, any>;
        ipAddress?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        action: string;
        userId: string;
        details: import("@prisma/working-client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        documentId: string;
    }>;
    getDocumentActivity(documentId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            action: string;
            userId: string;
            details: import("@prisma/working-client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            documentId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUserActivity(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            document: {
                id: string;
                originalName: string;
                mimeType: string;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            action: string;
            userId: string;
            details: import("@prisma/working-client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            documentId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
