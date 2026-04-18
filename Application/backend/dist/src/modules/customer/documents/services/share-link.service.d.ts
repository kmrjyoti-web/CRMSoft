import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ShareLinkAccess } from '@prisma/working-client';
export declare class ShareLinkService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createLink(data: {
        documentId: string;
        access?: ShareLinkAccess;
        password?: string;
        expiresAt?: Date;
        maxViews?: number;
        createdById: string;
    }): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        password: string | null;
        expiresAt: Date | null;
        token: string;
        viewCount: number;
        documentId: string;
        access: import("@prisma/working-client").$Enums.ShareLinkAccess;
        maxViews: number | null;
    }>;
    accessLink(token: string, password?: string): Promise<{
        document: any;
        access: import("@prisma/working-client").$Enums.ShareLinkAccess;
    }>;
    revokeLink(linkId: string, userId: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        password: string | null;
        expiresAt: Date | null;
        token: string;
        viewCount: number;
        documentId: string;
        access: import("@prisma/working-client").$Enums.ShareLinkAccess;
        maxViews: number | null;
    }>;
    getDocumentLinks(documentId: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        password: string | null;
        expiresAt: Date | null;
        token: string;
        viewCount: number;
        documentId: string;
        access: import("@prisma/working-client").$Enums.ShareLinkAccess;
        maxViews: number | null;
    }[]>;
}
