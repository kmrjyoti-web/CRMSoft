import { IQueryHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { GetMyMenuQuery } from './get-my-menu.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export interface MenuTreeItem {
    id: string;
    name: string;
    code: string;
    icon: string | null;
    route: string | null;
    menuType: string;
    badgeColor?: string | null;
    badgeText?: string | null;
    openInNewTab: boolean;
    isAdminOnly?: boolean;
    children: MenuTreeItem[];
}
export declare class GetMyMenuHandler implements IQueryHandler<GetMyMenuQuery> {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    execute(query: GetMyMenuQuery): Promise<MenuTreeItem[]>;
    private loadRolePermissions;
    private loadEnabledModules;
    private loadValidCredentials;
    private loadTerminology;
    private buildTree;
    private buildFilteredTree;
    private filterLevel;
    private isVisible5Check;
    private checkBusinessType;
    private toTreeItem;
}
