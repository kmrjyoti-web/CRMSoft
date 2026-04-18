import { IQueryHandler } from '@nestjs/cqrs';
import { GetRequestDetailQuery } from './get-request-detail.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetRequestDetailHandler implements IQueryHandler<GetRequestDetailQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetRequestDetailQuery): Promise<{
        maker: never;
        checker: never;
    } & {
        id: string;
        tenantId: string;
        entityType: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        action: string;
        checkerRole: string;
        entityId: string | null;
        expiresAt: Date;
        decidedAt: Date | null;
        payload: import("@prisma/working-client/runtime/library").JsonValue;
        makerNote: string | null;
        makerId: string;
        checkerId: string | null;
        checkerNote: string | null;
    }>;
}
