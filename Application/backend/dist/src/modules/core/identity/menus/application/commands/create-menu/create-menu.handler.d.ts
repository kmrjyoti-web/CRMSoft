import { ICommandHandler } from '@nestjs/cqrs';
import { CreateMenuCommand } from './create-menu.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class CreateMenuHandler implements ICommandHandler<CreateMenuCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateMenuCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        icon: string | null;
        sortOrder: number;
        industryCode: string | null;
        badgeText: string | null;
        parentId: string | null;
        route: string | null;
        menuType: string;
        permissionModule: string | null;
        permissionAction: string | null;
        badgeColor: string | null;
        openInNewTab: boolean;
        requiresCredential: boolean;
        credentialKey: string | null;
        businessTypeApplicability: import("@prisma/identity-client/runtime/library").JsonValue;
        autoEnableWithModule: string | null;
        terminologyKey: string | null;
        isAdminOnly: boolean;
    }>;
}
