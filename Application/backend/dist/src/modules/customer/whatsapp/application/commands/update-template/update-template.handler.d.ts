import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateTemplateCommand } from './update-template.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: UpdateTemplateCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: import("@prisma/working-client").$Enums.WaTemplateCategory;
        status: import("@prisma/working-client").$Enums.WaTemplateStatus;
        language: string;
        variables: import("@prisma/working-client/runtime/library").JsonValue | null;
        wabaId: string;
        bodyText: string;
        sentCount: number;
        deliveredCount: number;
        repliedCount: number;
        metaTemplateId: string | null;
        headerType: string | null;
        headerContent: string | null;
        footerText: string | null;
        buttons: import("@prisma/working-client/runtime/library").JsonValue | null;
        sampleValues: import("@prisma/working-client/runtime/library").JsonValue | null;
        readCount: number;
        lastSyncedAt: Date | null;
        rejectionReason: string | null;
    }>;
}
