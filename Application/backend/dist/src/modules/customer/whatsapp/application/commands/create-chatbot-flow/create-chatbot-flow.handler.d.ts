import { ICommandHandler } from '@nestjs/cqrs';
import { CreateChatbotFlowCommand } from './create-chatbot-flow.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateChatbotFlowHandler implements ICommandHandler<CreateChatbotFlowCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateChatbotFlowCommand): Promise<{
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
