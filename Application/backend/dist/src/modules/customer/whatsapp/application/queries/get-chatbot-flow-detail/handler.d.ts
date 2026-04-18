import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetChatbotFlowDetailQuery } from './query';
export declare class GetChatbotFlowDetailHandler implements IQueryHandler<GetChatbotFlowDetailQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetChatbotFlowDetailQuery): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isDefault: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.WaChatbotFlowStatus;
        wabaId: string;
        triggerKeywords: string[];
        nodes: import("@prisma/working-client/runtime/library").JsonValue;
        triggeredCount: number;
        completedCount: number;
    }>;
}
