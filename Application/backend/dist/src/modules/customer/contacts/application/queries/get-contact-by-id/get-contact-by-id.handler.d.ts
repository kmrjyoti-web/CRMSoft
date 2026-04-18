import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetContactByIdQuery } from './get-contact-by-id.query';
export declare class GetContactByIdHandler implements IQueryHandler<GetContactByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetContactByIdQuery): Promise<{
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
