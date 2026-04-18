import { IQueryHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { GetMenuTreeQuery } from './get-menu-tree.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class GetMenuTreeHandler implements IQueryHandler<GetMenuTreeQuery> {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    execute(query: GetMenuTreeQuery): Promise<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        icon: string | null;
        sortOrder: number;
        _count: {
            children: number;
        };
        badgeText: string | null;
        parentId: string | null;
        children: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            icon: string | null;
            sortOrder: number;
            _count: {
                children: number;
            };
            badgeText: string | null;
            parentId: string | null;
            children: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
                icon: string | null;
                sortOrder: number;
                _count: {
                    children: number;
                };
                badgeText: string | null;
                parentId: string | null;
                route: string | null;
                menuType: string;
                permissionModule: string | null;
                permissionAction: string | null;
                badgeColor: string | null;
                openInNewTab: boolean;
            }[];
            route: string | null;
            menuType: string;
            permissionModule: string | null;
            permissionAction: string | null;
            badgeColor: string | null;
            openInNewTab: boolean;
        }[];
        route: string | null;
        menuType: string;
        permissionModule: string | null;
        permissionAction: string | null;
        badgeColor: string | null;
        openInNewTab: boolean;
    }[]>;
}
