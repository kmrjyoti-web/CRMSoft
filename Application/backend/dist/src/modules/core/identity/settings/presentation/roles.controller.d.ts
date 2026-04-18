import { QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
declare class CreateRoleDto {
    name: string;
    displayName: string;
    description?: string;
    permissionIds?: string[];
}
declare class UpdateRoleDto {
    displayName?: string;
    description?: string;
    permissionIds?: string[];
}
declare class UpdateRolePermissionsDto {
    permissionIds: string[];
}
export declare class RolesController {
    private readonly queryBus;
    private readonly prisma;
    constructor(queryBus: QueryBus, prisma: PrismaService);
    findAll(req: any, search?: string): Promise<ApiResponse<any>>;
    findOne(id: string, req: any): Promise<ApiResponse<any>>;
    create(dto: CreateRoleDto): Promise<ApiResponse<{
        permissions: {
            id: string;
            description: string | null;
            createdAt: Date;
            action: string;
            module: string;
        }[];
        _count: {
            users: number;
        };
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        displayName: string;
        isSystem: boolean;
        parentRoleName: string | null;
        level: number;
        canManageLevels: number[];
    }>>;
    update(id: string, dto: UpdateRoleDto): Promise<ApiResponse<{
        permissions: {
            id: string;
            description: string | null;
            createdAt: Date;
            action: string;
            module: string;
        }[];
        _count: {
            users: number;
        };
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        displayName: string;
        isSystem: boolean;
        parentRoleName: string | null;
        level: number;
        canManageLevels: number[];
    }>>;
    updatePermissions(req: any, id: string, dto: UpdateRolePermissionsDto): Promise<ApiResponse<{
        roleId: string;
        permissionCount: number;
    }>>;
    remove(id: string): Promise<ApiResponse<{
        id: string;
    }>>;
}
export {};
