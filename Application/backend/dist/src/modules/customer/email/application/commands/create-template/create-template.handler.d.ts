import { ICommandHandler } from '@nestjs/cqrs';
import { CreateTemplateCommand } from './create-template.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateTemplateCommand): Promise<{
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
