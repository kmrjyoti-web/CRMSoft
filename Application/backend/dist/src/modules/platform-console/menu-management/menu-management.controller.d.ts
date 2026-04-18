import { MenuManagementService } from './menu-management.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { SetBrandOverrideDto } from './dto/set-brand-override.dto';
export declare class MenuManagementController {
    private readonly menuManagementService;
    constructor(menuManagementService: MenuManagementService);
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
    getMenuTree(): Promise<import("./menu-management.service").MenuTreeNode[]>;
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
    reorderMenuItems(body: Array<{
        id: string;
        sortOrder: number;
        parentKey?: string;
    }>): Promise<{
        success: boolean;
        updated: number;
    }>;
    getMenuWithBrandOverrides(brandId: string): Promise<import("./menu-management.service").MenuTreeNode[]>;
    setBrandOverride(brandId: string, dto: SetBrandOverrideDto): Promise<{
        id: string;
        sortOrder: number | null;
        menuKey: string;
        brandId: string;
        customLabel: string | null;
        customIcon: string | null;
        isHidden: boolean;
    }>;
    updateBrandOverride(id: string, body: {
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
    previewMenu(brandId: string): Promise<import("./menu-management.service").MenuTreeNode[]>;
    previewMenuWithRole(brandId: string, role: string): Promise<import("./menu-management.service").MenuTreeNode[]>;
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
}
