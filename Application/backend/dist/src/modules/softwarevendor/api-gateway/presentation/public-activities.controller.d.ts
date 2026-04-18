import { PrismaService } from '../../../../core/prisma/prisma.service';
import { PaginationQueryDto } from './dto/public-api.dto';
export declare class PublicActivitiesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(req: any, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/working-client").$Enums.ActivityType;
            lead: {
                id: string;
                leadNumber: string;
            } | null;
            contact: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
            subject: string;
            duration: number | null;
            outcome: string | null;
            scheduledAt: Date | null;
            completedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
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
        type: import("@prisma/working-client").$Enums.ActivityType;
        contactId: string | null;
        leadId: string | null;
        subject: string;
        duration: number | null;
        outcome: string | null;
        scheduledAt: Date | null;
        endTime: Date | null;
        completedAt: Date | null;
        latitude: import("@prisma/working-client/runtime/library").Decimal | null;
        longitude: import("@prisma/working-client/runtime/library").Decimal | null;
        locationName: string | null;
    }>;
    create(req: any, body: any): Promise<{
        id: string;
        tenantId: string;
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
        type: import("@prisma/working-client").$Enums.ActivityType;
        contactId: string | null;
        leadId: string | null;
        subject: string;
        duration: number | null;
        outcome: string | null;
        scheduledAt: Date | null;
        endTime: Date | null;
        completedAt: Date | null;
        latitude: import("@prisma/working-client/runtime/library").Decimal | null;
        longitude: import("@prisma/working-client/runtime/library").Decimal | null;
        locationName: string | null;
    }>;
}
