import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { SetBrandOverrideDto } from './dto/set-brand-override.dto';
export type MenuTreeNode = {
    id: string;
    menuKey: string;
    label: string;
    labelHi: string;
    icon?: string;
    route?: string;
    moduleCode?: string;
    verticalType?: string;
    sortOrder: number;
    isActive: boolean;
    children: MenuTreeNode[];
};
export declare class MenuManagementService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    getMenuTree(): Promise<MenuTreeNode[]>;
    getMenuFlat(): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        icon: string | null;
        sortOrder: number;
        label: string;
        menuKey: string;
        route: string | null;
        moduleCode: string | null;
        labelHi: string;
        verticalType: string | null;
        parentKey: string | null;
    }[]>;
    createMenuItem(dto: CreateMenuItemDto): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        icon: string | null;
        sortOrder: number;
        label: string;
        menuKey: string;
        route: string | null;
        moduleCode: string | null;
        labelHi: string;
        verticalType: string | null;
        parentKey: string | null;
    }>;
    updateMenuItem(id: string, dto: UpdateMenuItemDto): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        icon: string | null;
        sortOrder: number;
        label: string;
        menuKey: string;
        route: string | null;
        moduleCode: string | null;
        labelHi: string;
        verticalType: string | null;
        parentKey: string | null;
    }>;
    deleteMenuItem(id: string): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        icon: string | null;
        sortOrder: number;
        label: string;
        menuKey: string;
        route: string | null;
        moduleCode: string | null;
        labelHi: string;
        verticalType: string | null;
        parentKey: string | null;
    }>;
    reorderMenuItems(items: Array<{
        id: string;
        sortOrder: number;
        parentKey?: string;
    }>): Promise<{
        success: boolean;
        updated: number;
    }>;
    getMenuWithBrandOverrides(brandId: string): Promise<MenuTreeNode[]>;
    setBrandOverride(brandId: string, dto: SetBrandOverrideDto): Promise<{
        id: string;
        sortOrder: number | null;
        menuKey: string;
        brandId: string;
        customLabel: string | null;
        customIcon: string | null;
        isHidden: boolean;
    }>;
    updateBrandOverride(id: string, data: {
        customLabel?: string;
        customIcon?: string;
        isHidden?: boolean;
        sortOrder?: number;
    }): Promise<{
        id: string;
        sortOrder: number | null;
        menuKey: string;
        brandId: string;
        customLabel: string | null;
        customIcon: string | null;
        isHidden: boolean;
    }>;
    removeBrandOverride(id: string): Promise<{
        id: string;
        sortOrder: number | null;
        menuKey: string;
        brandId: string;
        customLabel: string | null;
        customIcon: string | null;
        isHidden: boolean;
    }>;
    getBrandOverrides(brandId: string): Promise<{
        id: string;
        sortOrder: number | null;
        menuKey: string;
        brandId: string;
        customLabel: string | null;
        customIcon: string | null;
        isHidden: boolean;
    }[]>;
    previewMenu(brandId: string, role?: string): Promise<MenuTreeNode[]>;
    private buildTree;
}
