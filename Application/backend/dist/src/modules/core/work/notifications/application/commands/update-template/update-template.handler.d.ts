import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateTemplateCommand } from './update-template.command';
import { NotificationTemplateService } from '../../../services/template.service';
export declare class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand> {
    private readonly templateService;
    private readonly logger;
    constructor(templateService: NotificationTemplateService);
    execute(command: UpdateTemplateCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: import("@prisma/working-client").$Enums.NotificationCategory;
        channels: import("@prisma/working-client/runtime/library").JsonValue;
        isSystem: boolean;
        channel: import("@prisma/working-client").$Enums.NotificationChannel | null;
        subject: string | null;
        body: string;
        bodyHtml: string | null;
        variables: import("@prisma/working-client/runtime/library").JsonValue;
        availableVariables: import("@prisma/working-client/runtime/library").JsonValue | null;
        industryCode: string | null;
    }>;
}
