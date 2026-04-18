export declare class CreateMenuCategoryDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    enabledRoutes?: string[];
    isDefault?: boolean;
}
export declare class UpdateMenuCategoryDto {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    enabledRoutes?: string[];
    isDefault?: boolean;
    isActive?: boolean;
}
export declare class ActivatePortalDto {
    linkedEntityType: string;
    linkedEntityId: string;
    linkedEntityName: string;
    email: string;
    displayName?: string;
    menuCategoryId?: string;
}
export declare class UpdatePageOverridesDto {
    pageOverrides: Record<string, boolean>;
}
export declare class CustomerPortalLoginDto {
    email: string;
    password: string;
}
export declare class RequestPasswordResetDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
