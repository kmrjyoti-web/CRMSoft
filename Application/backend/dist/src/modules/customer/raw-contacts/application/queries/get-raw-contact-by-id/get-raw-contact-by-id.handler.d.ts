import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetRawContactByIdQuery } from './get-raw-contact-by-id.query';
export declare class GetRawContactByIdHandler implements IQueryHandler<GetRawContactByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetRawContactByIdQuery): Promise<{
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
        status: import("@prisma/working-client").$Enums.RawContactStatus;
        source: import("@prisma/working-client").$Enums.RawContactSource;
        firstName: string;
        lastName: string;
        designation: string | null;
        department: string | null;
        companyName: string | null;
        notes: string | null;
        entityVerificationStatus: string;
        entityVerifiedVia: string | null;
        verifiedAt: Date | null;
        verifiedById: string | null;
        contactId: string | null;
    }>;
}
