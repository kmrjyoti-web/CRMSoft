import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class AttachmentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    attachDocument(documentId: string, entityType: string, entityId: string, userId: string): Promise<{
        id: string;
        tenantId: string;
        entityType: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        entityId: string;
        documentId: string;
        attachedById: string;
    }>;
    detachDocument(documentId: string, entityType: string, entityId: string): Promise<{
        id: string;
        tenantId: string;
        entityType: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        entityId: string;
        documentId: string;
        attachedById: string;
    }>;
    getEntityDocuments(entityType: string, entityId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            tenantId: string;
            entityType: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            entityId: string;
            documentId: string;
            attachedById: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDocumentEntities(documentId: string): Promise<{
        id: string;
        tenantId: string;
        entityType: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        entityId: string;
        documentId: string;
        attachedById: string;
    }[]>;
}
