import { IQueryHandler } from '@nestjs/cqrs';
import { GetMenuByIdQuery } from './get-menu-by-id.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetMenuByIdHandler implements IQueryHandler<GetMenuByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetMenuByIdQuery): Promise<{
        parent: {
            id: string;
            name: string;
            code: string;
        } | null;
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            icon: string | null;
            sortOrder: number;
            route: string | null;
            menuType: string;
        }[];
    } & {
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
