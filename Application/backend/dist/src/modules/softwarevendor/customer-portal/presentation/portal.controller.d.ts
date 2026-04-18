import { CustomerPortalService } from '../customer-portal.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CustomerPortalLoginDto, RequestPasswordResetDto, ResetPasswordDto } from './dto/customer-portal.dto';
export declare class PortalController {
    private readonly service;
    constructor(service: CustomerPortalService);
    login(tenantId: string, dto: CustomerPortalLoginDto): Promise<ApiResponse<{
        accessToken: string;
        user: {
            [x: string]: unknown;
        };
        menuCategory: {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            isDefault: boolean;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            color: string | null;
            icon: string | null;
            sortOrder: number;
            nameHi: string | null;
            enabledRoutes: import("@prisma/identity-client/runtime/library").JsonValue;
        } | null;
        availableRoutes: {
            key: string;
            label: string;
            icon: string;
            path: string;
        }[];
        isFirstLogin: boolean;
    }>>;
    forgotPassword(tenantId: string, dto: RequestPasswordResetDto): Promise<ApiResponse<{
        message: string;
        debug_token?: undefined;
    } | {
        message: string;
        debug_token: string;
    }>>;
    resetPassword(tenantId: string, dto: ResetPasswordDto): Promise<ApiResponse<{
        message: string;
    }>>;
    getRoutes(): ApiResponse<{
        key: string;
        label: string;
        icon: string;
        path: string;
    }[]>;
    getMe(tenantId: string, userId: string): Promise<ApiResponse<{
        availableRoutes: {
            key: string;
            label: string;
            icon: string;
            path: string;
        }[];
    }>>;
    updateMe(tenantId: string, userId: string, dto: {
        displayName?: string;
        phone?: string;
    }): Promise<ApiResponse<{
        [x: string]: unknown;
    }>>;
    changeMyPassword(tenantId: string, userId: string, dto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<ApiResponse<{
        message: string;
    }>>;
}
