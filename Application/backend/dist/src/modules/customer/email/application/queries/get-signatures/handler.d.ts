import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetSignaturesQuery } from './query';
export declare class GetSignaturesHandler implements IQueryHandler<GetSignaturesQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetSignaturesQuery): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        bodyHtml: string;
        userId: string;
    }[]>;
}
