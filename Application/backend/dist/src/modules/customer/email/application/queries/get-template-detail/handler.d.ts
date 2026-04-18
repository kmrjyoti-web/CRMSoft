import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetTemplateDetailQuery } from './query';
export declare class GetTemplateDetailHandler implements IQueryHandler<GetTemplateDetailQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetTemplateDetailQuery): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: import("@prisma/working-client").$Enums.TemplateCategory;
        usageCount: number;
        isSystem: boolean;
        subject: string;
        bodyHtml: string;
        variables: import("@prisma/working-client/runtime/library").JsonValue | null;
        createdByName: string;
        bodyText: string | null;
        isShared: boolean;
        openRate: import("@prisma/working-client/runtime/library").Decimal | null;
        clickRate: import("@prisma/working-client/runtime/library").Decimal | null;
        replyRate: import("@prisma/working-client/runtime/library").Decimal | null;
    }>;
}
