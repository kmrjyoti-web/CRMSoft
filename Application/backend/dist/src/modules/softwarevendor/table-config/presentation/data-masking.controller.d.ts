import { ApiResponse } from '../../../../common/utils/api-response';
import { DataMaskingService } from '../services/data-masking.service';
import { CreateMaskingPolicyDto, UpdateMaskingPolicyDto } from './dto/create-masking-policy.dto';
import { UnmaskRequestDto } from './dto/unmask-request.dto';
export declare class DataMaskingController {
    private readonly service;
    constructor(service: DataMaskingService);
    getRules(tableKey: string, userId: string, roleId: string, tenantId: string): Promise<ApiResponse<import("../services/data-masking.service").MaskingRule[]>>;
    listPolicies(tenantId: string, tableKey?: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        roleId: string | null;
        userId: string | null;
        tableKey: string;
        columnId: string;
        maskType: string;
        canUnmask: boolean;
    }[]>>;
    createPolicy(dto: CreateMaskingPolicyDto, tenantId: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        roleId: string | null;
        userId: string | null;
        tableKey: string;
        columnId: string;
        maskType: string;
        canUnmask: boolean;
    }>>;
    updatePolicy(id: string, dto: UpdateMaskingPolicyDto): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        roleId: string | null;
        userId: string | null;
        tableKey: string;
        columnId: string;
        maskType: string;
        canUnmask: boolean;
    }>>;
    deletePolicy(id: string): Promise<ApiResponse<{
        deleted: boolean;
    }>>;
    unmask(dto: UnmaskRequestDto, userId: string, tenantId: string): Promise<ApiResponse<{
        value: string | null;
    }>>;
}
