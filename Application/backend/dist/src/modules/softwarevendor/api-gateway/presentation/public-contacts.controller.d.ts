import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PaginationQueryDto } from './dto/public-api.dto';
export declare class PublicContactsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(req: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            designation: string | null;
            department: string | null;
            organization: {
                id: string;
                name: string;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(req: any, id: string): Promise<{
        organization: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        firstName: string;
        lastName: string;
        designation: string | null;
        department: string | null;
        notes: string | null;
        entityVerificationStatus: string;
        entityVerifiedVia: string | null;
        organizationId: string | null;
        verticalData: import("@prisma/working-client/runtime/library").JsonValue | null;
        dataStatus: import("@prisma/working-client").$Enums.DataStatus;
        entityVerifiedAt: Date | null;
    }>;
    create(req: any, body: any): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        firstName: string;
        lastName: string;
        designation: string | null;
        department: string | null;
        notes: string | null;
        entityVerificationStatus: string;
        entityVerifiedVia: string | null;
        organizationId: string | null;
        verticalData: import("@prisma/working-client/runtime/library").JsonValue | null;
        dataStatus: import("@prisma/working-client").$Enums.DataStatus;
        entityVerifiedAt: Date | null;
    }>;
    update(req: any, id: string, body: any): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        firstName: string;
        lastName: string;
        designation: string | null;
        department: string | null;
        notes: string | null;
        entityVerificationStatus: string;
        entityVerifiedVia: string | null;
        organizationId: string | null;
        verticalData: import("@prisma/working-client/runtime/library").JsonValue | null;
        dataStatus: import("@prisma/working-client").$Enums.DataStatus;
        entityVerifiedAt: Date | null;
    }>;
}
